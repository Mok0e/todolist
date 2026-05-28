'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

jest.mock('../../utils/jwtUtils', () => ({
  verifyToken: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
}));
jest.mock('../../services/todoService', () => ({
  getTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  completeTodo: jest.fn(),
  incompleteTodo: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const todoRoutes = require('../../routes/todoRoutes');
const errorHandler = require('../../middleware/errorHandler');
const todoService = require('../../services/todoService');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userId = 'test-user-id';
  next();
});
app.use('/todos', todoRoutes);
app.use(errorHandler);

const mockTodo = {
  id: 'todo-1',
  title: '테스트',
  description: null,
  status: 'NOT_STARTED',
  startDate: null,
  endDate: null,
  category: { id: 'cat-1', name: '기본' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET /todos ───────────────────────────────────────────────────────────────

describe('GET /todos', () => {
  test('200 → { data: [...] }', async () => {
    todoService.getTodos.mockResolvedValue([mockTodo]);

    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [mockTodo] });
    expect(todoService.getTodos).toHaveBeenCalledWith('test-user-id', {
      status: undefined,
      categoryId: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
    });
  });

  test('쿼리 파라미터 전달 - status/categoryId', async () => {
    todoService.getTodos.mockResolvedValue([]);

    await request(app).get('/todos?status=DONE&categoryId=cat-2');

    expect(todoService.getTodos).toHaveBeenCalledWith('test-user-id', expect.objectContaining({
      status: 'DONE',
      categoryId: 'cat-2',
    }));
  });
});

// ─── POST /todos ──────────────────────────────────────────────────────────────

describe('POST /todos', () => {
  test('201 → { data: {...} }', async () => {
    todoService.createTodo.mockResolvedValue(mockTodo);

    const res = await request(app).post('/todos').send({ title: '테스트' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: mockTodo });
    expect(todoService.createTodo).toHaveBeenCalledWith('test-user-id', expect.objectContaining({
      title: '테스트',
    }));
  });

  test('service가 TODO_TITLE_TOO_LONG throw → 400', async () => {
    const err = new Error('제목이 너무 깁니다.');
    err.statusCode = 400;
    err.code = 'TODO_TITLE_TOO_LONG';
    todoService.createTodo.mockRejectedValue(err);

    const res = await request(app).post('/todos').send({ title: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TODO_TITLE_TOO_LONG');
  });
});

// ─── PATCH /todos/:id ─────────────────────────────────────────────────────────

describe('PATCH /todos/:id', () => {
  test('200 → { data: {...} }', async () => {
    const updated = { ...mockTodo, title: '수정됨' };
    todoService.updateTodo.mockResolvedValue(updated);

    const res = await request(app).patch('/todos/todo-1').send({ title: '수정됨' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });
    expect(todoService.updateTodo).toHaveBeenCalledWith('test-user-id', 'todo-1', expect.objectContaining({ title: '수정됨' }));
  });

  test('service가 FORBIDDEN throw → 403', async () => {
    const err = new Error('접근 권한이 없습니다.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    todoService.updateTodo.mockRejectedValue(err);

    const res = await request(app).patch('/todos/todo-1').send({ title: '수정됨' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ─── DELETE /todos/:id ────────────────────────────────────────────────────────

describe('DELETE /todos/:id', () => {
  test('200 → { data: {} }', async () => {
    todoService.deleteTodo.mockResolvedValue({});

    const res = await request(app).delete('/todos/todo-1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: {} });
    expect(todoService.deleteTodo).toHaveBeenCalledWith('test-user-id', 'todo-1');
  });

  test('service가 TODO_NOT_FOUND throw → 404', async () => {
    const err = new Error('할 일을 찾을 수 없습니다.');
    err.statusCode = 404;
    err.code = 'TODO_NOT_FOUND';
    todoService.deleteTodo.mockRejectedValue(err);

    const res = await request(app).delete('/todos/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('TODO_NOT_FOUND');
  });
});

// ─── PATCH /todos/:id/complete ────────────────────────────────────────────────

describe('PATCH /todos/:id/complete', () => {
  test('200 → status DONE 포함 DTO', async () => {
    const doneTodo = { ...mockTodo, status: 'DONE' };
    todoService.completeTodo.mockResolvedValue(doneTodo);

    const res = await request(app).patch('/todos/todo-1/complete');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DONE');
    expect(todoService.completeTodo).toHaveBeenCalledWith('test-user-id', 'todo-1');
  });
});

// ─── PATCH /todos/:id/incomplete ─────────────────────────────────────────────

describe('PATCH /todos/:id/incomplete', () => {
  test('200 → 재계산된 status 포함 DTO', async () => {
    const recalcTodo = { ...mockTodo, status: 'IN_PROGRESS' };
    todoService.incompleteTodo.mockResolvedValue(recalcTodo);

    const res = await request(app).patch('/todos/todo-1/incomplete');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(todoService.incompleteTodo).toHaveBeenCalledWith('test-user-id', 'todo-1');
  });
});
