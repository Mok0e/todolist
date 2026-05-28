'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../../config/db');
const categoryRepository = require('../categoryRepository');

const mockClient = { query: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── createDefault ────────────────────────────────────────────────────────────

describe('categoryRepository.createDefault', () => {
  test('INSERT 후 rows[0] 반환', async () => {
    const row = { id: 'cat-1', name: '기본', is_default: true };
    mockClient.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.createDefault(mockClient, 'user-1');

    expect(mockClient.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual(row);
  });
});

// ─── findByUserId ─────────────────────────────────────────────────────────────

describe('categoryRepository.findByUserId', () => {
  test('여러 행 반환', async () => {
    const rows = [
      { id: 'cat-1', name: '기본', is_default: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
      { id: 'cat-2', name: '업무', is_default: false, created_at: '2026-01-02', updated_at: '2026-01-02' },
    ];
    pool.query.mockResolvedValue({ rows });

    const result = await categoryRepository.findByUserId('user-1');

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual(rows);
  });
});

// ─── findById ─────────────────────────────────────────────────────────────────

describe('categoryRepository.findById', () => {
  test('존재하는 경우 rows[0] 반환', async () => {
    const row = { id: 'cat-1', name: '기본', is_default: true, created_at: '2026-01-01', updated_at: '2026-01-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.findById('cat-1');

    expect(result).toEqual(row);
  });

  test('없는 경우 null 반환', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await categoryRepository.findById('nonexistent');

    expect(result).toBeNull();
  });
});

// ─── findByNameForUser ────────────────────────────────────────────────────────

describe('categoryRepository.findByNameForUser', () => {
  test('존재하는 경우 rows[0] 반환', async () => {
    const row = { id: 'cat-2', name: '업무', is_default: false, created_at: '2026-01-01', updated_at: '2026-01-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.findByNameForUser('user-1', '업무');

    expect(result).toEqual(row);
  });

  test('없는 경우 null 반환', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await categoryRepository.findByNameForUser('user-1', '없는카테고리');

    expect(result).toBeNull();
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('categoryRepository.create', () => {
  test('INSERT 후 rows[0] 반환', async () => {
    const row = { id: 'cat-3', name: '개인', is_default: false, created_at: '2026-01-01', updated_at: '2026-01-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.create('user-1', '개인');

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual(row);
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('categoryRepository.update', () => {
  test('UPDATE 후 rows[0] 반환', async () => {
    const row = { id: 'cat-2', name: '수정된이름', is_default: false, created_at: '2026-01-01', updated_at: '2026-01-02' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.update('cat-2', '수정된이름');

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual(row);
  });
});

// ─── deleteById ───────────────────────────────────────────────────────────────

describe('categoryRepository.deleteById', () => {
  test('query 호출됨', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await categoryRepository.deleteById('cat-2');

    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});

// ─── findDefaultByUserId ──────────────────────────────────────────────────────

describe('categoryRepository.findDefaultByUserId', () => {
  test('is_default=true 카테고리 반환', async () => {
    const row = { id: 'cat-1', name: '기본', is_default: true, created_at: '2026-01-01', updated_at: '2026-01-01' };
    pool.query.mockResolvedValue({ rows: [row] });

    const result = await categoryRepository.findDefaultByUserId('user-1');

    expect(result).toEqual(row);
  });
});

// ─── moveTodosToCategory ──────────────────────────────────────────────────────

describe('categoryRepository.moveTodosToCategory', () => {
  test('client.query로 UPDATE 호출됨', async () => {
    mockClient.query.mockResolvedValue({ rowCount: 3 });

    await categoryRepository.moveTodosToCategory(mockClient, 'cat-2', 'cat-1');

    expect(mockClient.query).toHaveBeenCalledTimes(1);
  });
});
