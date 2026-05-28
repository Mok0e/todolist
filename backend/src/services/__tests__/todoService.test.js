'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../repositories/todoRepository', () => ({
  findByUserId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  setStatus: jest.fn(),
  deleteById: jest.fn(),
}));
jest.mock('../../repositories/categoryRepository', () => ({
  findDefaultByUserId: jest.fn(),
}));
jest.mock('../../utils/statusCalculator', () => ({
  calculateStatus: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const todoRepository = require('../../repositories/todoRepository');
const categoryRepository = require('../../repositories/categoryRepository');
const { calculateStatus } = require('../../utils/statusCalculator');
const todoService = require('../todoService');

const baseRow = {
  id: 'todo-1',
  user_id: 'user-1',
  category_id: 'cat-1',
  category_name: '기본',
  title: '테스트 할 일',
  description: null,
  status: null,
  start_date: null,
  end_date: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  calculateStatus.mockReturnValue('NOT_STARTED');
});

// ─── getTodos ─────────────────────────────────────────────────────────────────

describe('todoService.getTodos', () => {
  test('필터 없이 전체 목록 반환', async () => {
    todoRepository.findByUserId.mockResolvedValue([baseRow]);

    const result = await todoService.getTodos('user-1', {});

    expect(todoRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      categoryId: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('todo-1');
  });

  test('status=DONE 필터 - calculateStatus가 DONE 반환하는 항목만 포함', async () => {
    const doneRow = { ...baseRow, id: 'todo-done', status: 'DONE' };
    const notStartedRow = { ...baseRow, id: 'todo-ns', status: null };
    todoRepository.findByUserId.mockResolvedValue([doneRow, notStartedRow]);

    calculateStatus
      .mockReturnValueOnce('DONE')
      .mockReturnValueOnce('NOT_STARTED');

    const result = await todoService.getTodos('user-1', { status: 'DONE' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('todo-done');
    expect(result[0].status).toBe('DONE');
  });

  test('status=OVERDUE 필터 - OVERDUE 항목만 포함', async () => {
    todoRepository.findByUserId.mockResolvedValue([
      { ...baseRow, id: 't1' },
      { ...baseRow, id: 't2' },
    ]);
    calculateStatus.mockReturnValueOnce('OVERDUE').mockReturnValueOnce('NOT_STARTED');

    const result = await todoService.getTodos('user-1', { status: 'OVERDUE' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  test('빈 목록 반환', async () => {
    todoRepository.findByUserId.mockResolvedValue([]);

    const result = await todoService.getTodos('user-1', {});

    expect(result).toEqual([]);
  });
});

// ─── createTodo ───────────────────────────────────────────────────────────────

describe('todoService.createTodo', () => {
  test('정상 생성 성공 - DTO 반환', async () => {
    todoRepository.create.mockResolvedValue({ id: 'todo-new' });
    todoRepository.findById.mockResolvedValue({ ...baseRow, id: 'todo-new' });
    calculateStatus.mockReturnValue('NOT_STARTED');

    const result = await todoService.createTodo('user-1', {
      title: '새 할 일',
      description: null,
      categoryId: 'cat-1',
      startDate: null,
      endDate: null,
    });

    expect(todoRepository.create).toHaveBeenCalledWith('user-1', expect.objectContaining({
      categoryId: 'cat-1',
      title: '새 할 일',
    }));
    expect(result.id).toBe('todo-new');
    expect(result.status).toBe('NOT_STARTED');
  });

  test('categoryId 미전달 시 기본 카테고리 자동 사용', async () => {
    categoryRepository.findDefaultByUserId.mockResolvedValue({ id: 'default-cat', name: '기본' });
    todoRepository.create.mockResolvedValue({ id: 'todo-new' });
    todoRepository.findById.mockResolvedValue({ ...baseRow, id: 'todo-new', category_id: 'default-cat' });

    await todoService.createTodo('user-1', { title: '제목만', description: null, startDate: null, endDate: null });

    expect(categoryRepository.findDefaultByUserId).toHaveBeenCalledWith('user-1');
    expect(todoRepository.create).toHaveBeenCalledWith('user-1', expect.objectContaining({
      categoryId: 'default-cat',
    }));
  });

  test('제목 없음 → 400 VALIDATION_ERROR', async () => {
    await expect(
      todoService.createTodo('user-1', { title: '', categoryId: 'cat-1' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
  });

  test('제목 101자 이상 → 400 TODO_TITLE_TOO_LONG', async () => {
    await expect(
      todoService.createTodo('user-1', { title: 'a'.repeat(101), categoryId: 'cat-1' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'TODO_TITLE_TOO_LONG' });
  });

  test('설명 1001자 이상 → 400 TODO_DESC_TOO_LONG', async () => {
    await expect(
      todoService.createTodo('user-1', { title: '제목', description: 'a'.repeat(1001), categoryId: 'cat-1' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'TODO_DESC_TOO_LONG' });
  });

  test('endDate < startDate → 400 TODO_DATE_INVALID', async () => {
    await expect(
      todoService.createTodo('user-1', {
        title: '제목',
        categoryId: 'cat-1',
        startDate: '2026-06-01',
        endDate: '2026-05-01',
      })
    ).rejects.toMatchObject({ statusCode: 400, code: 'TODO_DATE_INVALID' });
  });
});

// ─── updateTodo ───────────────────────────────────────────────────────────────

describe('todoService.updateTodo', () => {
  test('정상 수정 성공 - DTO 반환', async () => {
    const updatedRow = { ...baseRow, title: '수정된 제목' };
    todoRepository.findById
      .mockResolvedValueOnce(baseRow)
      .mockResolvedValueOnce(updatedRow);
    todoRepository.update.mockResolvedValue({ id: 'todo-1' });

    const result = await todoService.updateTodo('user-1', 'todo-1', { title: '수정된 제목' });

    expect(todoRepository.update).toHaveBeenCalledWith('todo-1', expect.objectContaining({ title: '수정된 제목' }));
    expect(result.title).toBe('수정된 제목');
  });

  test('존재하지 않는 todo → 404 TODO_NOT_FOUND', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(
      todoService.updateTodo('user-1', 'nonexistent', { title: '제목' })
    ).rejects.toMatchObject({ statusCode: 404, code: 'TODO_NOT_FOUND' });
  });

  test('타인 todo 수정 → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...baseRow, user_id: 'other-user' });

    await expect(
      todoService.updateTodo('user-1', 'todo-1', { title: '제목' })
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  test('endDate < startDate → 400 TODO_DATE_INVALID', async () => {
    todoRepository.findById.mockResolvedValue(baseRow);

    await expect(
      todoService.updateTodo('user-1', 'todo-1', {
        startDate: '2026-06-01',
        endDate: '2026-05-01',
      })
    ).rejects.toMatchObject({ statusCode: 400, code: 'TODO_DATE_INVALID' });
  });
});

// ─── deleteTodo ───────────────────────────────────────────────────────────────

describe('todoService.deleteTodo', () => {
  test('정상 삭제 성공 - 빈 객체 반환', async () => {
    todoRepository.findById.mockResolvedValue(baseRow);
    todoRepository.deleteById.mockResolvedValue();

    const result = await todoService.deleteTodo('user-1', 'todo-1');

    expect(result).toEqual({});
    expect(todoRepository.deleteById).toHaveBeenCalledWith('todo-1');
  });

  test('존재하지 않는 todo → 404 TODO_NOT_FOUND', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(
      todoService.deleteTodo('user-1', 'nonexistent')
    ).rejects.toMatchObject({ statusCode: 404, code: 'TODO_NOT_FOUND' });
  });

  test('타인 todo 삭제 → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...baseRow, user_id: 'other-user' });

    await expect(
      todoService.deleteTodo('user-1', 'todo-1')
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });
});

// ─── completeTodo ─────────────────────────────────────────────────────────────

describe('todoService.completeTodo', () => {
  test('정상 완료 처리 - status=DONE DTO 반환', async () => {
    const doneRow = { ...baseRow, status: 'DONE' };
    todoRepository.findById
      .mockResolvedValueOnce(baseRow)
      .mockResolvedValueOnce(doneRow);
    todoRepository.setStatus.mockResolvedValue({ id: 'todo-1' });
    calculateStatus.mockReturnValue('DONE');

    const result = await todoService.completeTodo('user-1', 'todo-1');

    expect(todoRepository.setStatus).toHaveBeenCalledWith('todo-1', 'DONE');
    expect(result.status).toBe('DONE');
  });

  test('존재하지 않는 todo → 404 TODO_NOT_FOUND', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(
      todoService.completeTodo('user-1', 'nonexistent')
    ).rejects.toMatchObject({ statusCode: 404, code: 'TODO_NOT_FOUND' });
  });

  test('타인 todo → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...baseRow, user_id: 'other-user' });

    await expect(
      todoService.completeTodo('user-1', 'todo-1')
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });
});

// ─── incompleteTodo ───────────────────────────────────────────────────────────

describe('todoService.incompleteTodo', () => {
  test('완료 취소 후 날짜 기준 재계산 상태 반환', async () => {
    const recalcRow = { ...baseRow, status: null, start_date: '2026-01-01', end_date: '2026-12-31' };
    todoRepository.findById
      .mockResolvedValueOnce({ ...baseRow, status: 'DONE' })
      .mockResolvedValueOnce(recalcRow);
    todoRepository.setStatus.mockResolvedValue({ id: 'todo-1' });
    calculateStatus.mockReturnValue('IN_PROGRESS');

    const result = await todoService.incompleteTodo('user-1', 'todo-1');

    expect(todoRepository.setStatus).toHaveBeenCalledWith('todo-1', null);
    expect(result.status).toBe('IN_PROGRESS');
  });

  test('존재하지 않는 todo → 404 TODO_NOT_FOUND', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(
      todoService.incompleteTodo('user-1', 'nonexistent')
    ).rejects.toMatchObject({ statusCode: 404, code: 'TODO_NOT_FOUND' });
  });

  test('타인 todo → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...baseRow, user_id: 'other-user' });

    await expect(
      todoService.incompleteTodo('user-1', 'todo-1')
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });
});
