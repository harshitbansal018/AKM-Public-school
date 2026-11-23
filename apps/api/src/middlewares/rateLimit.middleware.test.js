import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { applicationLimiter, enquiryLimiter } from './rateLimit.middleware.js';

describe('public form rate limits', () => {
  it('keeps admission enquiries and job applications independent', async () => {
    const app = express();
    app.post('/enquiries', enquiryLimiter, (_req, res) => res.sendStatus(204));
    app.post('/applications', applicationLimiter, (_req, res) => res.sendStatus(204));

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app).post('/enquiries').expect(204);
    }

    const blocked = await request(app).post('/enquiries').expect(429);
    expect(blocked.body.message).toContain('enquiries');

    await request(app).post('/applications').expect(204);
  });
});
