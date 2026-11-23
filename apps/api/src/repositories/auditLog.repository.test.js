import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  create: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../config/prisma.js', () => ({
  prisma: { $transaction: database.transaction },
}));

import { create, retentionCutoff } from './auditLog.repository.js';

describe('audit log rolling retention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.deleteMany.mockResolvedValue({ count: 3 });
    database.create.mockResolvedValue({ id: 99 });
    database.transaction.mockImplementation((callback) => callback({
      auditLog: { deleteMany: database.deleteMany, create: database.create },
    }));
  });

  it('calculates an exact 30-day cutoff', () => {
    const now = new Date('2026-11-23T02:00:00.000Z');
    expect(retentionCutoff(now).toISOString()).toBe('2026-10-24T02:00:00.000Z');
  });

  it('deletes expired entries and creates the new entry in one transaction', async () => {
    const entry = { actorKind: 'system', action: 'test.created', category: 'settings', summary: 'Test' };
    await expect(create(entry)).resolves.toEqual({ id: 99 });

    expect(database.transaction).toHaveBeenCalledOnce();
    expect(database.deleteMany).toHaveBeenCalledOnce();
    expect(database.deleteMany.mock.calls[0][0].where.createdAt.lt).toBeInstanceOf(Date);
    expect(database.create).toHaveBeenCalledWith({ data: entry });
  });
});
