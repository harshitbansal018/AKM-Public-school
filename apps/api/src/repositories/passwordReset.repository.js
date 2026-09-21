import { prisma } from '../config/prisma.js';

/**
 * One-time password-reset tokens. Only the SHA-256 hash of a token is stored,
 * so a leaked table cannot be used to reset anyone's password.
 */

export function create(data) {
  return prisma.passwordReset.create({ data });
}

/** The unused, unexpired reset behind a token hash, or null. */
export function findLive(tokenHash) {
  return prisma.passwordReset.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });
}

export function markUsed(id) {
  return prisma.passwordReset.update({ where: { id }, data: { usedAt: new Date() } });
}

/** Retires every open reset for an account, so only the newest email works. */
export function retireFor(kind, accountId) {
  return prisma.passwordReset.updateMany({
    where: { kind, accountId, usedAt: null },
    data: { usedAt: new Date() },
  });
}
