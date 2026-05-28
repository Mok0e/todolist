'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../repositories/categoryRepository', () => ({
  findByUserId: jest.fn(),
  findById: jest.fn(),
  findByNameForUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  findDefaultByUserId: jest.fn(),
  moveTodosToCategory: jest.fn(),
}));
jest.mock('../../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const categoryRepository = require('../../repositories/categoryRepository');
const db = require('../../config/db');
const categoryService = require('../categoryService');

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  db.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({});
});

// ─── listCategories ───────────────────────────────────────────────────────────

describe('categoryService.listCategories', () => {
  test('카테고리 목록 반환 - camelCase 변환 확인', async () => {
    categoryRepository.findByUserId.mockResolvedValue([
      { id: 'cat-1', name: '기본', is_default: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-02T00:00:00.000Z' },
      { id: 'cat-2', name: '업무', is_default: false, created_at: '2026-01-03T00:00:00.000Z', updated_at: '2026-01-04T00:00:00.000Z' },
    ]);

    const result = await categoryService.listCategories('user-1');

    expect(result).toEqual([
      { id: 'cat-1', name: '기본', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' },
      { id: 'cat-2', name: '업무', isDefault: false, createdAt: '2026-01-03T00:00:00.000Z', updatedAt: '2026-01-04T00:00:00.000Z' },
    ]);
    expect(categoryRepository.findByUserId).toHaveBeenCalledWith('user-1');
  });

  test('빈 배열 반환', async () => {
    categoryRepository.findByUserId.mockResolvedValue([]);

    const result = await categoryService.listCategories('user-1');

    expect(result).toEqual([]);
  });
});

// ─── createCategory ───────────────────────────────────────────────────────────

describe('categoryService.createCategory', () => {
  test('정상 생성 성공 - camelCase 변환 확인', async () => {
    categoryRepository.findByNameForUser.mockResolvedValue(null);
    categoryRepository.create.mockResolvedValue({
      id: 'cat-3',
      name: '개인',
      is_default: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    const result = await categoryService.createCategory('user-1', { name: '개인' });

    expect(result).toEqual({
      id: 'cat-3',
      name: '개인',
      isDefault: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(categoryRepository.create).toHaveBeenCalledWith('user-1', '개인');
  });

  test('name이 빈 문자열 → 400 VALIDATION_ERROR', async () => {
    await expect(
      categoryService.createCategory('user-1', { name: '' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('name이 31자 이상 → 400 CATEGORY_NAME_TOO_LONG', async () => {
    const longName = 'a'.repeat(31);
    await expect(
      categoryService.createCategory('user-1', { name: longName })
    ).rejects.toMatchObject({ statusCode: 400, code: 'CATEGORY_NAME_TOO_LONG' });
  });

  test('동일 사용자 내 중복 이름 → 409 CATEGORY_NAME_DUPLICATE', async () => {
    categoryRepository.findByNameForUser.mockResolvedValue({ id: 'cat-2', name: '업무' });

    await expect(
      categoryService.createCategory('user-1', { name: '업무' })
    ).rejects.toMatchObject({ statusCode: 409, code: 'CATEGORY_NAME_DUPLICATE' });
  });
});

// ─── updateCategory ───────────────────────────────────────────────────────────

describe('categoryService.updateCategory', () => {
  test('정상 수정 성공 - camelCase 변환 확인', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'user-1',
    });
    categoryRepository.findByNameForUser.mockResolvedValue(null);
    categoryRepository.update.mockResolvedValue({
      id: 'cat-2',
      name: '수정된이름',
      is_default: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    });

    const result = await categoryService.updateCategory('user-1', 'cat-2', { name: '수정된이름' });

    expect(result).toEqual({
      id: 'cat-2',
      name: '수정된이름',
      isDefault: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  test('카테고리 없음 → 404 NOT_FOUND', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.updateCategory('user-1', 'nonexistent', { name: '새이름' })
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  test('타인 카테고리 → 403 FORBIDDEN', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'other-user',
    });

    await expect(
      categoryService.updateCategory('user-1', 'cat-2', { name: '새이름' })
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  test('기본 카테고리 수정 → 400 CATEGORY_DEFAULT_IMMUTABLE', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-1',
      name: '기본',
      is_default: true,
      user_id: 'user-1',
    });

    await expect(
      categoryService.updateCategory('user-1', 'cat-1', { name: '새이름' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'CATEGORY_DEFAULT_IMMUTABLE' });
  });

  test('중복 이름 → 409 CATEGORY_NAME_DUPLICATE', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'user-1',
    });
    categoryRepository.findByNameForUser.mockResolvedValue({ id: 'cat-3', name: '개인' });

    await expect(
      categoryService.updateCategory('user-1', 'cat-2', { name: '개인' })
    ).rejects.toMatchObject({ statusCode: 409, code: 'CATEGORY_NAME_DUPLICATE' });
  });
});

// ─── deleteCategory ───────────────────────────────────────────────────────────

describe('categoryService.deleteCategory', () => {
  test('정상 삭제 성공 - 빈 객체 반환', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'user-1',
    });
    categoryRepository.findDefaultByUserId.mockResolvedValue({ id: 'cat-1', name: '기본' });
    categoryRepository.moveTodosToCategory.mockResolvedValue();
    categoryRepository.deleteById.mockResolvedValue();

    const result = await categoryService.deleteCategory('user-1', 'cat-2');

    expect(result).toEqual({});
  });

  test('카테고리 없음 → 404 NOT_FOUND', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.deleteCategory('user-1', 'nonexistent')
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  test('타인 카테고리 → 403 FORBIDDEN', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'other-user',
    });

    await expect(
      categoryService.deleteCategory('user-1', 'cat-2')
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  test('기본 카테고리 삭제 → 400 CATEGORY_DEFAULT_IMMUTABLE', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-1',
      name: '기본',
      is_default: true,
      user_id: 'user-1',
    });

    await expect(
      categoryService.deleteCategory('user-1', 'cat-1')
    ).rejects.toMatchObject({ statusCode: 400, code: 'CATEGORY_DEFAULT_IMMUTABLE' });
  });

  test('트랜잭션 내에서 todos 이동 후 삭제 확인', async () => {
    const defaultCat = { id: 'cat-1', name: '기본' };
    categoryRepository.findById.mockResolvedValue({
      id: 'cat-2',
      name: '업무',
      is_default: false,
      user_id: 'user-1',
    });
    categoryRepository.findDefaultByUserId.mockResolvedValue(defaultCat);
    categoryRepository.moveTodosToCategory.mockResolvedValue();
    categoryRepository.deleteById.mockResolvedValue();

    await categoryService.deleteCategory('user-1', 'cat-2');

    expect(categoryRepository.moveTodosToCategory).toHaveBeenCalledWith(
      expect.anything(),
      'cat-2',
      'cat-1'
    );
    expect(categoryRepository.deleteById).toHaveBeenCalledWith('cat-2');
  });
});
