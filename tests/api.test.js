const request = require('supertest');
const app = require('../server');

describe('GET /api/files', () => {
  it('should return files', async () => {
    const res = await request(app).get('/api/files');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
