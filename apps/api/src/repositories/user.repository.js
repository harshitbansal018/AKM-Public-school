import { prisma } from '../config/prisma.js';

export function findById(id) {
  return prisma.user.findUnique({ where: { id: Number(id) } });
}

/** Used by sign-in — the only place the password hash is ever read. */
export function findByEmail(email) {
  return prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
}

export function findAll() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export function create(data) {
  return prisma.user.create({ data: { ...data, email: data.email.toLowerCase() } });
}

export function update(id, data) {
  const patch = { ...data };
  if (patch.email) patch.email = patch.email.toLowerCase();
  return prisma.user.update({ where: { id: Number(id) }, data: patch });
}

export function remove(id) {
  return prisma.user.delete({ where: { id: Number(id) } });
}

export function touchLastLogin(id) {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { lastLoginAt: new Date() },
  });
}

export function count() {
  return prisma.user.count();
}
