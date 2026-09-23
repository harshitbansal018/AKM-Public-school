import crypto from 'node:crypto';
import {
  userRepository,
  facultyRepository,
  parentRepository,
  passwordResetRepository,
} from '../repositories/index.js';
import * as mailService from './mail.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import * as audit from './audit.service.js';

const authActor = (kind, account) =>
  account
    ? { kind, id: account.id, name: account.name, role: kind === TOKEN_KIND.USER ? account.role : kind === TOKEN_KIND.FACULTY ? 'TEACHER' : 'PARENT' }
    : { kind: 'system' };
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TOKEN_KIND } from '../utils/jwt.js';
import { serializeUser, serializeTeacher, serializeParent } from '../serializers/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Three portals, three account tables, one sign-in flow.
 *
 * Each kind says where its accounts live, when one is allowed in, what goes
 * into the token, and what the client is told about the person. The flow
 * itself (password check, deactivation, token issue, refresh) is shared.
 */
const ACCOUNTS = {
  [TOKEN_KIND.USER]: {
    findByEmail: (email) => userRepository.findByEmail(email),
    findById: (id) => userRepository.findById(id),
    allowed: (user) => user.isActive,
    denied: 'That account has been deactivated',
    touch: (user) => userRepository.touchLastLogin(user.id),
    subject: (user) => user,
    serialize: serializeUser,
    /** What later requests see as req.user. */
    shape: (user) => user,
    setPassword: (user, passwordHash) => userRepository.update(user.id, { passwordHash }),
    email: (user) => user.email,
    portal: 'admin',
    portalName: 'AKM Admin Panel',
    purpose: 'Use it to manage the website and the school records.',
  },
  [TOKEN_KIND.FACULTY]: {
    findByEmail: (email) => facultyRepository.findFirst({ accountEmail: email }),
    findById: (id) => facultyRepository.findById(id),
    allowed: (faculty) => faculty.teacherAccess,
    denied: 'This account does not have teacher portal access',
    subject: (faculty) => ({ id: faculty.id, email: faculty.accountEmail, role: 'TEACHER' }),
    serialize: serializeTeacher,
    shape: (faculty) => ({ ...faculty, email: faculty.accountEmail, role: 'TEACHER' }),
    setPassword: (faculty, passwordHash) => facultyRepository.update(faculty.id, { passwordHash }),
    email: (faculty) => faculty.accountEmail,
    portal: 'teacher',
    portalName: 'AKM Teacher Portal',
    purpose: 'Use it to set homework and enter results for your classes.',
  },
  [TOKEN_KIND.PARENT]: {
    findByEmail: (email) => parentRepository.findFirst({ email }),
    findById: (id) => parentRepository.findById(id),
    allowed: (parent) => parent.isActive,
    denied: 'That account has been deactivated',
    touch: (parent) => parentRepository.update(parent.id, { lastLoginAt: new Date() }),
    subject: (parent) => ({ id: parent.id, email: parent.email, role: 'PARENT' }),
    serialize: serializeParent,
    shape: (parent) => ({ ...parent, role: 'PARENT' }),
    setPassword: (parent, passwordHash) => parentRepository.update(parent.id, { passwordHash }),
    email: (parent) => parent.email,
    portal: 'parent',
    portalName: 'AKM Parent Portal',
    purpose: "Use it to follow your child's homework, results and fees.",
  },
};

function accounts(kind) {
  const config = ACCOUNTS[kind];
  if (!config) throw new Error(`Unknown account kind: ${kind}`);
  return config;
}

/**
 * A wrong email and a wrong password return the identical message on purpose —
 * distinguishing them would let someone enumerate which accounts exist. The
 * password is hashed even for a missing account so the timing matches too.
 */
export async function login(kind, email, password) {
  const config = accounts(kind);
  const account = await config.findByEmail(String(email).toLowerCase());
  const failure = ApiError.unauthorized('Incorrect email or password');

  const portal = config.portalName;
  if (!account?.passwordHash) {
    await hashPassword(password);
    audit.record({ action: 'auth.login_failed', category: 'auth', summary: `Failed sign-in to ${portal}: ${email} (no such account)`, actor: { kind: 'system' } });
    throw failure;
  }
  if (!(await verifyPassword(password, account.passwordHash))) {
    audit.record({ action: 'auth.login_failed', category: 'auth', summary: `Failed sign-in to ${portal}: ${email} (wrong password)`, actor: authActor(kind, account) });
    throw failure;
  }
  if (!config.allowed(account)) throw ApiError.forbidden(config.denied);

  await config.touch?.(account);
  audit.record({ action: 'auth.login', category: 'auth', summary: `${account.name} signed in to ${portal}`, actor: authActor(kind, account) });

  const subject = config.subject(account);
  return {
    user: config.serialize(account),
    accessToken: signAccessToken(subject, kind),
    refreshToken: signRefreshToken(subject, kind),
  };
}

/** Exchanges a valid refresh token of this kind for a new access token. */
export async function refresh(kind, refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Please sign in again');

  const config = accounts(kind);
  const payload = verifyRefreshToken(refreshToken, kind);
  const account = await config.findById(payload.sub);

  if (!account || !config.allowed(account)) throw ApiError.unauthorized('Please sign in again');

  return {
    user: config.serialize(account),
    accessToken: signAccessToken(config.subject(account), kind),
  };
}

/**
 * The live account behind an access token, re-read from the database rather
 * than trusted from the token, so deactivating someone takes effect at once.
 */
export async function loadAccount(kind, id) {
  const config = accounts(kind);
  const account = await config.findById(id);

  if (!account) throw ApiError.unauthorized('That account no longer exists');
  if (!config.allowed(account)) throw ApiError.forbidden(config.denied);

  return config.shape(account);
}

export function serializeAccount(kind, account) {
  return accounts(kind).serialize(account);
}

/* ---------------------------------------------------------------
   Forgot password. The token goes out by email and only its hash is kept;
   it works once, for RESET_TTL_MINUTES, and asking again retires the old one.
   --------------------------------------------------------------- */

const RESET_TTL_MINUTES = 60;
const WELCOME_TTL_MINUTES = 7 * 24 * 60;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/** A fresh one-time link to the portal's reset page; older links are retired. */
async function issueResetLink(kind, account, ttlMinutes) {
  const config = accounts(kind);
  const token = crypto.randomBytes(32).toString('base64url');
  await passwordResetRepository.retireFor(kind, account.id);
  await passwordResetRepository.create({
    kind,
    accountId: account.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  });
  return `${env.publicBaseUrl}/${config.portal}/reset-password?token=${token}`;
}

/**
 * The email a teacher or parent gets when the office creates their account:
 * the portal address, their login email and a week-long link to choose their
 * own password. Never throws — a save must not fail because mail is down.
 *
 * @param {string} [password]  the starting password the office typed, included
 *        in the email so the person can sign in at once
 */
export async function sendWelcome(kind, account, password) {
  const config = accounts(kind);
  const to = config.email(account);
  if (!to) return { sent: false, reason: 'no email' };
  try {
    const resetUrl = await issueResetLink(kind, account, WELCOME_TTL_MINUTES);
    return await mailService.send({
      to,
      subject: `Your ${config.portalName} account`,
      template: 'account-welcome',
      values: {
        name: account.name,
        email: to,
        portalName: config.portalName,
        portalUrl: `${env.publicBaseUrl}/${config.portal}/login`,
        purpose: config.purpose,
        password: password ?? 'the password the school office gave you',
        resetUrl,
        expiresIn: '7 days',
      },
    });
  } catch (error) {
    logger.error(`Welcome email to ${to} failed:`, error.message);
    return { sent: false, reason: error.message };
  }
}

/**
 * Always resolves the same way whether or not the email is known, so the
 * form cannot be used to discover which addresses have accounts.
 *
 */
export async function requestPasswordReset(kind, email) {
  const config = accounts(kind);
  const account = await config.findByEmail(String(email).toLowerCase());
  if (!account || !config.allowed(account)) {
    logger.info(`[password-reset] no eligible ${kind} account for ${email}`);
    return { requested: true };
  }

  const resetUrl = await issueResetLink(kind, account, RESET_TTL_MINUTES);
  audit.record({ action: 'auth.reset_requested', category: 'auth', summary: `Password reset link emailed to ${account.name} (${config.email(account)}) for ${config.portalName}`, actor: authActor(kind, account) });
  await mailService.send({
    to: config.email(account),
    subject: `Reset your ${config.portalName} password`,
    template: 'password-reset',
    values: {
      name: account.name,
      email: config.email(account),
      portalName: config.portalName,
      resetUrl,
      expiresIn: `${RESET_TTL_MINUTES} minutes`,
    },
  });

  return { requested: true };
}

/** Sets a new password from a live token, then retires the token. */
export async function resetPassword(kind, token, newPassword) {
  const config = accounts(kind);
  const reset = await passwordResetRepository.findLive(hashToken(token));
  if (!reset || reset.kind !== kind) {
    throw ApiError.badRequest('This reset link is not valid or has expired — please ask for a new one');
  }

  const account = await config.findById(reset.accountId);
  if (!account || !config.allowed(account)) {
    throw ApiError.badRequest('This account can no longer be used');
  }

  await config.setPassword(account, await hashPassword(newPassword));
  await passwordResetRepository.markUsed(reset.id);
  audit.record({ action: 'auth.password_reset', category: 'auth', summary: `${account.name} set a new ${config.portalName} password via the emailed link`, actor: authActor(kind, account) });
  return { reset: true };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('Account not found');

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Your current password is not correct');

  await userRepository.update(userId, { passwordHash: await hashPassword(newPassword) });
  audit.record({ action: 'auth.password_changed', category: 'auth', entityType: 'User', entityId: user.id, entityLabel: `${user.name} (${user.email})`, summary: `${user.name} changed their admin panel password` });
  return { changed: true };
}
