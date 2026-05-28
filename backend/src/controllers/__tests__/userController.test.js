'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../services/userService');
jest.mock('../../utils/jwtUtils');

const request = require('supertest');
const app = require('../../app');
const userService = require('../../services/userService');
const { verifyToken } = require('../../utils/jwtUtils');

beforeEach(() => {
  jest.clearAllMocks();
  verifyToken.mockReturnValue({ userId: 'test-user-id' });
});

// ─── GET /users/me ────────────────────────────────────────────────────────────

describe('GET /users/me', () => {
  test('유효한 Bearer 토큰 → 200 { data }', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: '홍길동',
      theme: 'light',
      language: 'ko',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    userService.getMe.mockResolvedValue(mockUser);

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer fake-valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: mockUser });
    expect(userService.getMe).toHaveBeenCalledWith('test-user-id');
  });

  test('토큰 없음 → 401 AUTH_TOKEN_MISSING', async () => {
    const res = await request(app).get('/users/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_TOKEN_MISSING');
  });
});

// ─── PATCH /users/me ──────────────────────────────────────────────────────────

describe('PATCH /users/me', () => {
  test('유효한 토큰 + name → 200 { data }', async () => {
    const updatedUser = { id: 'test-user-id', email: 'test@example.com', name: '새이름' };
    userService.updateMe.mockResolvedValue(updatedUser);

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer fake-valid-token')
      .send({ name: '새이름' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updatedUser });
    expect(userService.updateMe).toHaveBeenCalledWith('test-user-id', { name: '새이름' });
  });

  test('userService.updateMe가 AUTH_PASSWORD_MISMATCH 에러 → 401', async () => {
    const err = new Error('현재 비밀번호가 올바르지 않습니다.');
    err.statusCode = 401;
    err.code = 'AUTH_PASSWORD_MISMATCH';
    userService.updateMe.mockRejectedValue(err);

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer fake-valid-token')
      .send({ currentPassword: 'WrongPass1', newPassword: 'NewPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_PASSWORD_MISMATCH');
  });
});

// ─── DELETE /users/me ─────────────────────────────────────────────────────────

describe('DELETE /users/me', () => {
  test('유효한 토큰 → 200 { data: {} }', async () => {
    userService.deleteMe.mockResolvedValue({});

    const res = await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer fake-valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: {} });
    expect(userService.deleteMe).toHaveBeenCalledWith('test-user-id');
  });
});
