'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../repositories/userRepository');
jest.mock('../../utils/passwordUtils');

const userRepository = require('../../repositories/userRepository');
const { comparePassword, hashPassword } = require('../../utils/passwordUtils');
const userService = require('../userService');

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getMe ────────────────────────────────────────────────────────────────────

describe('userService.getMe', () => {
  test('정상 조회 → { id, email, name, theme, language, createdAt, updatedAt } 반환', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: '홍길동',
      theme: 'light',
      language: 'ko',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await userService.getMe('user-1');

    expect(result).toMatchObject({
      id: 'user-1',
      email: 'test@example.com',
      name: '홍길동',
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  test('존재하지 않는 userId → 401 AUTH_USER_DELETED', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(userService.getMe('nonexistent-id')).rejects.toMatchObject({
      statusCode: 401,
      code: 'AUTH_USER_DELETED',
    });
  });
});

// ─── updateMe ─────────────────────────────────────────────────────────────────

describe('userService.updateMe', () => {
  const existingUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: '홍길동',
    password: 'hashed-old-password',
  };

  test('이름만 변경 → 성공', async () => {
    userRepository.update.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: '새이름' });

    const result = await userService.updateMe('user-1', { name: '새이름' });

    expect(result).toEqual({ id: 'user-1', email: 'test@example.com', name: '새이름' });
    expect(userRepository.update).toHaveBeenCalledWith('user-1', { name: '새이름', passwordHash: undefined });
  });

  test('비밀번호만 변경 (currentPassword + newPassword) → 성공', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('hashed-new-password');
    userRepository.update.mockResolvedValue({ id: 'user-1', email: 'test@example.com', name: '홍길동' });

    const result = await userService.updateMe('user-1', {
      currentPassword: 'OldPass1',
      newPassword: 'NewPass1',
    });

    expect(result).toMatchObject({ id: 'user-1', email: 'test@example.com' });
    expect(hashPassword).toHaveBeenCalledWith('NewPass1');
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      name: undefined,
      passwordHash: 'hashed-new-password',
    });
  });

  test('아무것도 안 보내면 → 400 VALIDATION_ERROR', async () => {
    await expect(userService.updateMe('user-1', {})).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('newPassword는 있는데 currentPassword 없으면 → 400 VALIDATION_ERROR', async () => {
    await expect(
      userService.updateMe('user-1', { newPassword: 'NewPass1' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('currentPassword 불일치 → 401 AUTH_PASSWORD_MISMATCH', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    comparePassword.mockResolvedValue(false);

    await expect(
      userService.updateMe('user-1', { currentPassword: 'WrongPass1', newPassword: 'NewPass1' })
    ).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_PASSWORD_MISMATCH' });
  });

  test('새 비밀번호 규칙 위반 → 400 AUTH_PASSWORD_WEAK', async () => {
    userRepository.findById.mockResolvedValue(existingUser);
    comparePassword.mockResolvedValue(true);

    await expect(
      userService.updateMe('user-1', { currentPassword: 'OldPass1', newPassword: 'weak' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'AUTH_PASSWORD_WEAK' });
  });
});

// ─── updateSettings ───────────────────────────────────────────────────────────

describe('userService.updateSettings', () => {
  test('theme만 변경 → { theme, language } 반환', async () => {
    userRepository.updateSettings.mockResolvedValue({ theme: 'DARK', language: 'ko' });

    const result = await userService.updateSettings('user-1', { theme: 'DARK' });

    expect(result).toEqual({ theme: 'DARK', language: 'ko' });
    expect(userRepository.updateSettings).toHaveBeenCalledWith('user-1', { theme: 'DARK', language: undefined });
  });

  test('language만 변경 → { theme, language } 반환', async () => {
    userRepository.updateSettings.mockResolvedValue({ theme: 'LIGHT', language: 'en' });

    const result = await userService.updateSettings('user-1', { language: 'en' });

    expect(result).toEqual({ theme: 'LIGHT', language: 'en' });
  });

  test('theme + language 동시 변경 → 성공', async () => {
    userRepository.updateSettings.mockResolvedValue({ theme: 'DARK', language: 'en' });

    const result = await userService.updateSettings('user-1', { theme: 'DARK', language: 'en' });

    expect(result).toEqual({ theme: 'DARK', language: 'en' });
  });

  test('theme/language 둘 다 없으면 → 400 VALIDATION_ERROR', async () => {
    await expect(
      userService.updateSettings('user-1', {})
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('허용되지 않은 theme 값 → 400 VALIDATION_ERROR', async () => {
    await expect(
      userService.updateSettings('user-1', { theme: 'BLUE' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('허용되지 않은 language 값 → 400 VALIDATION_ERROR', async () => {
    await expect(
      userService.updateSettings('user-1', { language: 'jp' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });
});

// ─── deleteMe ─────────────────────────────────────────────────────────────────

describe('userService.deleteMe', () => {
  test('정상 삭제 → {} 반환', async () => {
    userRepository.deleteById.mockResolvedValue();

    const result = await userService.deleteMe('user-1');

    expect(result).toEqual({});
    expect(userRepository.deleteById).toHaveBeenCalledWith('user-1');
  });
});
