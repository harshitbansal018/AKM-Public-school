import { userRepository, facultyRepository, parentRepository } from '../repositories/index.js';
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
  },
  [TOKEN_KIND.FACULTY]: {
    findByEmail: (email) => facultyRepository.findFirst({ accountEmail: email }),
    findById: (id) => facultyRepository.findById(id),
    allowed: (faculty) => faculty.teacherAccess,
    denied: 'This account does not have teacher portal access',
    subject: (faculty) => ({ id: faculty.id, email: faculty.accountEmail, role: 'TEACHER' }),
    serialize: serializeTeacher,
    shape: (faculty) => ({ ...faculty, email: faculty.accountEmail, role: 'TEACHER' }),
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

  if (!account?.passwordHash) {
    await hashPassword(password);
    throw failure;
  }
  if (!(await verifyPassword(password, account.passwordHash))) throw failure;
  if (!config.allowed(account)) throw ApiError.forbidden(config.denied);

  await config.touch?.(account);

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

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('Account not found');

  const matches = await verifyPassword(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Your current password is not correct');

  await userRepository.update(userId, { passwordHash: await hashPassword(newPassword) });
  return { changed: true };
}
