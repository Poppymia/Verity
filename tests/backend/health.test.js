import request from 'supertest';
import { createApp } from '../../backend/app.js';

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const app = createApp({
      fetchImpl: async () => {
        throw new Error('fetch should not be called for /api/health');
      }
    });

    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

