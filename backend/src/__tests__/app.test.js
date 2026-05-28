'use strict';

const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('200 상태코드와 { status: "ok" }를 반환한다', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('Content-Type 헤더에 application/json이 포함된다', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('CORS 헤더(Access-Control-Allow-Origin)가 포함된다', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('존재하지 않는 경로', () => {
  it('GET /nonexistent → 404를 반환한다', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
