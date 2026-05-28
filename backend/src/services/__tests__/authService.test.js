'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/categoryRepository');
jest.mock('../../utils/passwordUtils');
jest.mock('../../utils/jwtUtils');
jest.mock('../../config/db');

const userRepository = require('../../repositories/userRepository');
const categoryRepository = require('../../repositories/categoryRepository');
const { hashPassword, comparePassword } = require('../../utils/passwordUtils');
const { signToken } = require('../../utils/jwtUtils');
const pool = require('../../config/db');
const authService = require('../authService');

const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  pool.connect = jest.fn().mockResolvedValue(mockClient);
});

// ─── register ────────────────────────────────────────────────────────────────

describe('authService.register', () => {
  test('정상 가입 성공 → { id, email, name } 반환', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: '홍길동' });
    categoryRepository.createDefault.mockResolvedValue();

    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password1',
      name: '홍길동',
    });

    expect(result).toEqual({ id: 'user-1', email: 'test@example.com', name: '홍길동' });
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('잘못된 이메일 형식 → 400 VALIDATION_ERROR', async () => {
    await expect(
      authService.register({ email: 'not-an-email', password: 'Password1', name: '홍길동' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('비밀번호 8자 미만 → 400 AUTH_PASSWORD_WEAK', async () => {
    await expect(
      authService.register({ email: 'test@example.com', password: 'Pass1', name: '홍길동' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'AUTH_PASSWORD_WEAK' });
  });

  test('비밀번호 영문 없음 → 400 AUTH_PASSWORD_WEAK', async () => {
    await expect(
      authService.register({ email: 'test@example.com', password: '12345678', name: '홍길동' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'AUTH_PASSWORD_WEAK' });
  });

  test('비밀번호 숫자 없음 → 400 AUTH_PASSWORD_WEAK', async () => {
    await expect(
      authService.register({ email: 'test@example.com', password: 'PasswordOnly', name: '홍길동' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'AUTH_PASSWORD_WEAK' });
  });

  test('이름 빈 문자열 → 400 VALIDATION_ERROR', async () => {
    await expect(
      authService.register({ email: 'test@example.com', password: 'Password1', name: '' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('이름 51자 초과 → 400 VALIDATION_ERROR', async () => {
    const longName = 'a'.repeat(51);
    await expect(
      authService.register({ email: 'test@example.com', password: 'Password1', name: longName })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('이메일 중복 → 409 AUTH_EMAIL_DUPLICATE', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(
      authService.register({ email: 'test@example.com', password: 'Password1', name: '홍길동' })
    ).rejects.toMatchObject({ statusCode: 409, code: 'AUTH_EMAIL_DUPLICATE' });
  });

  test('트랜잭션 실패 시 ROLLBACK 호출', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashed-password');
    userRepository.create.mockRejectedValue(new Error('DB error'));

    await expect(
      authService.register({ email: 'test@example.com', password: 'Password1', name: '홍길동' })
    ).rejects.toThrow();

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('authService.login', () => {
  test('정상 로그인 → { accessToken } 반환', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
    });
    comparePassword.mockResolvedValue(true);
    signToken.mockReturnValue('jwt-access-token');

    const result = await authService.login({ email: 'test@example.com', password: 'Password1' });

    expect(result).toEqual({ accessToken: 'jwt-access-token' });
    expect(signToken).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  test('존재하지 않는 이메일 → 401 AUTH_INVALID_CREDENTIALS', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nobody@example.com', password: 'Password1' })
    ).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS' });
  });

  test('비밀번호 불일치 → 401 AUTH_INVALID_CREDENTIALS', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
    });
    comparePassword.mockResolvedValue(false);

    await expect(
      authService.login({ email: 'test@example.com', password: 'WrongPass1' })
    ).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS' });
  });
});
