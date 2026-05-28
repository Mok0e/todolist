'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

const TEST_ENV = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/todolist_test',
  JWT_SECRET: 'test-secret-key-for-testing',
  PORT: '3000',
  NODE_ENV: 'test',
  BCRYPT_SALT_ROUNDS: '1',
  CORS_ORIGIN: 'http://localhost:5173',
};

describe('passwordUtils', () => {
  let hashPassword;
  let comparePassword;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...TEST_ENV };
    jest.resetModules();
    jest.isolateModules(() => {
      ({ hashPassword, comparePassword } = require('../passwordUtils'));
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('hashPassword가 bcrypt 해시를 반환한다 (원문과 다름)', async () => {
    const password = 'myPassword123';
    const hash = await hashPassword(password);
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  test('동일 비밀번호를 두 번 해싱하면 서로 다른 결과가 나온다 (salt)', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });

  test('comparePassword가 올바른 비밀번호에서 true를 반환한다', async () => {
    const password = 'correctPassword';
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  test('comparePassword가 틀린 비밀번호에서 false를 반환한다', async () => {
    const password = 'correctPassword';
    const wrongPassword = 'wrongPassword';
    const hash = await hashPassword(password);
    const result = await comparePassword(wrongPassword, hash);
    expect(result).toBe(false);
  });
});
