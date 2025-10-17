// tests/api/gif.create.test.js
const request = require('supertest');
const express = require('express');
const gifApi = require('../../.vscode/api/gif/create');
const fs = require('fs');
const path = require('path');

describe('GIF API', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/gif', gifApi);
  });

  it('should return 400 if no images uploaded', async () => {
    const res = await request(app)
      .post('/gif/create')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No images uploaded');
  });

  // Add more tests for valid uploads, invalid file types, etc.
});
