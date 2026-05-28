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
}));

const pool = require('../../config/db');
const todoRepository = require('../todoRepository');

const mockRow = {
  id: 'todo-1',
  user_id: 'user-1',
  category_id: 'cat-1',
  category_name: '기본',
  title: '테스트',
  description: null,
  status: null,
  start_date: null,
  end_date: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── findByUserId ─────────────────────────────────────────────────────────────

describe('todoRepository.findByUserId', () => {
  test('필터 없이 user_id 조건만으로 목록 반환', async () => {
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await todoRepository.findByUserId('user-1');

    expect(pool.query).toHaveBeenCalledTimes(1);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('t.user_id = $1');
    expect(values).toEqual(['user-1']);
    expect(result).toEqual([mockRow]);
  });

  test('categoryId 필터 적용 시 조건에 포함', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await todoRepository.findByUserId('user-1', { categoryId: 'cat-2' });

    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('t.category_id = $2');
    expect(values).toContain('cat-2');
  });

  test('dueDateFrom/dueDateTo 필터 적용 시 조건에 포함', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await todoRepository.findByUserId('user-1', { dueDateFrom: '2026-01-01', dueDateTo: '2026-12-31' });

    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('t.end_date >=');
    expect(sql).toContain('t.end_date <=');
    expect(values).toContain('2026-01-01');
    expect(values).toContain('2026-12-31');
  });
});

// ─── findById ─────────────────────────────────────────────────────────────────

describe('todoRepository.findById', () => {
  test('존재하는 경우 rows[0] 반환', async () => {
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await todoRepository.findById('todo-1');

    expect(result).toEqual(mockRow);
  });

  test('없는 경우 null 반환', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await todoRepository.findById('nonexistent');

    expect(result).toBeNull();
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('todoRepository.create', () => {
  test('INSERT 후 id 포함 rows[0] 반환', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'todo-new' }] });

    const result = await todoRepository.create('user-1', {
      categoryId: 'cat-1',
      title: '새 할 일',
      description: null,
      startDate: null,
      endDate: null,
    });

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'todo-new' });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('todoRepository.update', () => {
  test('업데이트할 필드가 있으면 rows[0] 반환', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'todo-1' }] });

    const result = await todoRepository.update('todo-1', { title: '수정된 제목' });

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'todo-1' });
  });

  test('업데이트할 필드가 없으면 null 반환', async () => {
    const result = await todoRepository.update('todo-1', {});

    expect(pool.query).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

// ─── setStatus ────────────────────────────────────────────────────────────────

describe('todoRepository.setStatus', () => {
  test('status 업데이트 후 rows[0] 반환', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'todo-1' }] });

    const result = await todoRepository.setStatus('todo-1', 'DONE');

    expect(pool.query).toHaveBeenCalledTimes(1);
    const [, values] = pool.query.mock.calls[0];
    expect(values[0]).toBe('DONE');
    expect(result).toEqual({ id: 'todo-1' });
  });

  test('status=null (완료 취소) 로 업데이트 가능', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 'todo-1' }] });

    await todoRepository.setStatus('todo-1', null);

    const [, values] = pool.query.mock.calls[0];
    expect(values[0]).toBeNull();
  });
});

// ─── deleteById ───────────────────────────────────────────────────────────────

describe('todoRepository.deleteById', () => {
  test('DELETE query 호출됨', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });

    await todoRepository.deleteById('todo-1');

    expect(pool.query).toHaveBeenCalledTimes(1);
    const [, values] = pool.query.mock.calls[0];
    expect(values).toEqual(['todo-1']);
  });
});
