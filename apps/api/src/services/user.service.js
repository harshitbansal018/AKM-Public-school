import { userRepository } from '../repositories/index.js';
import { serializeUser, serializeUsers } from '../serializers/index.js';
import { hashPassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';

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

  return serializeUser(
    await userRepository.create({ ...rest, passwordHash: await hashPassword(password) })
  );
}

export async function update(id, { password, ...rest }) {
  await getById(id);

  return serializeUser(
    await userRepository.update(id, {
      ...rest,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    })
  );
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
  return { deleted: true };
}
