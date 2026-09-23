import { userRepository } from '../repositories/index.js';
import { serializeUser, serializeUsers } from '../serializers/index.js';
import { hashPassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';
import * as audit from './audit.service.js';

const userAudit = (verb, row, changes, summary) =>
  audit.record({
    action: `users.${verb}`,
    category: 'users',
    label: 'User',
    entityType: 'User',
    entityId: row.id,
    entityLabel: `${row.name} (${row.email}, ${row.role})`,
    changes,
    summary,
  });

export async function list() {
  return serializeUsers(await userRepository.findAll());
}

export async function getById(id) {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return serializeUser(user);
}

export async function create({ password, ...rest }) {
  const existing = await userRepository.findByEmail(rest.email);
  if (existing) throw ApiError.conflict('An account with that email already exists');

  const user = await userRepository.create({ ...rest, passwordHash: await hashPassword(password) });
  userAudit('created', user);
  return serializeUser(user);
}

export async function update(id, { password, ...rest }) {
  const before = await userRepository.findById(id);
  if (!before) throw ApiError.notFound('User not found');

  const user = await userRepository.update(id, {
    ...rest,
    ...(password ? { passwordHash: await hashPassword(password) } : {}),
  });
  const changes = audit.diff(before, user);
  userAudit(changes.role ? 'role_changed' : 'updated', user, changes);
  return serializeUser(user);
}

/**
 * Deleting the last administrator would lock everyone out of the panel with no
 * way back in, so it is refused.
 */
export async function remove(id, currentUserId) {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (Number(id) === Number(currentUserId)) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const admins = (await userRepository.findAll()).filter(
    (candidate) => candidate.role === 'ADMIN' && candidate.isActive
  );
  if (user.role === 'ADMIN' && admins.length <= 1) {
    throw ApiError.badRequest('This is the last administrator account — it cannot be deleted');
  }

  await userRepository.remove(id);
  userAudit('deleted', user);
  return { deleted: true };
}
