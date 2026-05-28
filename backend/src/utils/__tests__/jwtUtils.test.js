'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

const TEST_ENV = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/todolist_test',
  JWT_SECRET: 'test-secret-key-for-jwt-testing',
  PORT: '3000',
  NODE_ENV: 'test',
  BCRYPT_SALT_ROUNDS: '1',
  CORS_ORIGIN: 'http://localhost:5173',
};

describe('jwtUtils', () => {
  let signToken;
  let verifyToken;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...TEST_ENV };
    jest.resetModules();
    jest.isolateModules(() => {
      ({ signToken, verifyToken } = require('../jwtUtils'));
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('signToken이 string을 반환한다', () => {
    const token = signToken({ userId: 1 });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('verifyToken이 유효한 토큰에서 payload를 올바르게 반환한다 (userId 포함)', () => {
    const token = signToken({ userId: 42 });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(42);
  });

  test('verifyToken이 만료된 토큰에서 TokenExpiredError를 throw한다', () => {
    let expiredToken;
    jest.isolateModules(() => {
      const jwt = require('jsonwebtoken');
      expiredToken = jwt.sign({ userId: 1 }, TEST_ENV.JWT_SECRET, { expiresIn: -1 });
    });
    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });

  test('verifyToken이 잘못된 토큰 문자열에서 JsonWebTokenError를 throw한다', () => {
    expect(() => verifyToken('invalid.token.string')).toThrow();
  });

  test('verifyToken이 빈 문자열에서 에러를 throw한다', () => {
    expect(() => verifyToken('')).toThrow();
  });

  test('signToken 후 verifyToken 왕복 테스트: 동일한 payload가 복원된다', () => {
    const payload = { userId: 99, role: 'user' };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });
});
