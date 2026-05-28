'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../services/authService');

const request = require('supertest');
const app = require('../../app');
const authService = require('../../services/authService');

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  test('201 성공 → { data: { id, email, name } }', async () => {
    authService.register.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: '홍길동' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Password1', name: '홍길동' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: { id: 'user-1', email: 'test@example.com', name: '홍길동' } });
  });

  test('authService.register가 AUTH_PASSWORD_WEAK 에러 throw → 400', async () => {
    const err = new Error('비밀번호가 약합니다.');
    err.statusCode = 400;
    err.code = 'AUTH_PASSWORD_WEAK';
    authService.register.mockRejectedValue(err);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'weak', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('AUTH_PASSWORD_WEAK');
  });

  test('authService.register가 AUTH_EMAIL_DUPLICATE 에러 throw → 409', async () => {
    const err = new Error('이미 사용 중인 이메일입니다.');
    err.statusCode = 409;
    err.code = 'AUTH_EMAIL_DUPLICATE';
    authService.register.mockRejectedValue(err);

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'duplicate@example.com', password: 'Password1', name: '홍길동' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('AUTH_EMAIL_DUPLICATE');
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  test('200 성공 → { data: { accessToken } }', async () => {
    authService.login.mockResolvedValue({ accessToken: 'jwt-access-token' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { accessToken: 'jwt-access-token' } });
  });

  test('authService.login이 AUTH_INVALID_CREDENTIALS 에러 throw → 401', async () => {
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.statusCode = 401;
    err.code = 'AUTH_INVALID_CREDENTIALS';
    authService.login.mockRejectedValue(err);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
  });
});
