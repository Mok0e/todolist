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
jest.mock('../../services/categoryService', () => ({
  listCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../../routes/categoryRoutes');
const errorHandler = require('../../middleware/errorHandler');
const categoryService = require('../../services/categoryService');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userId = 'test-user-id';
  next();
});
app.use('/categories', categoryRoutes);
app.use(errorHandler);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET /categories ──────────────────────────────────────────────────────────

describe('GET /categories', () => {
  test('200 → { data: [...] }', async () => {
    const mockList = [
      { id: 'cat-1', name: '기본', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'cat-2', name: '업무', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' },
    ];
    categoryService.listCategories.mockResolvedValue(mockList);

    const res = await request(app).get('/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: mockList });
    expect(categoryService.listCategories).toHaveBeenCalledWith('test-user-id');
  });
});

// ─── POST /categories ─────────────────────────────────────────────────────────

describe('POST /categories', () => {
  test('201 → { data: {...} }', async () => {
    const created = {
      id: 'cat-3',
      name: '개인',
      isDefault: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    categoryService.createCategory.mockResolvedValue(created);

    const res = await request(app).post('/categories').send({ name: '개인' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: created });
    expect(categoryService.createCategory).toHaveBeenCalledWith('test-user-id', { name: '개인' });
  });

  test('service가 VALIDATION_ERROR throw → 400', async () => {
    const err = new Error('카테고리 이름은 필수입니다.');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    categoryService.createCategory.mockRejectedValue(err);

    const res = await request(app).post('/categories').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ─── PATCH /categories/:id ────────────────────────────────────────────────────

describe('PATCH /categories/:id', () => {
  test('200 → { data: {...} }', async () => {
    const updated = {
      id: 'cat-2',
      name: '수정된이름',
      isDefault: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    categoryService.updateCategory.mockResolvedValue(updated);

    const res = await request(app).patch('/categories/cat-2').send({ name: '수정된이름' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });
    expect(categoryService.updateCategory).toHaveBeenCalledWith('test-user-id', 'cat-2', { name: '수정된이름' });
  });

  test('service가 FORBIDDEN throw → 403 에러 전파', async () => {
    const err = new Error('접근 권한이 없습니다.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    categoryService.updateCategory.mockRejectedValue(err);

    const res = await request(app).patch('/categories/cat-2').send({ name: '수정된이름' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

// ─── DELETE /categories/:id ───────────────────────────────────────────────────

describe('DELETE /categories/:id', () => {
  test('200 → { data: {} }', async () => {
    categoryService.deleteCategory.mockResolvedValue({});

    const res = await request(app).delete('/categories/cat-2');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: {} });
    expect(categoryService.deleteCategory).toHaveBeenCalledWith('test-user-id', 'cat-2');
  });

  test('기본 카테고리 삭제 시 service가 CATEGORY_DEFAULT_IMMUTABLE throw → 400 에러 전파', async () => {
    const err = new Error('기본 카테고리는 삭제할 수 없습니다.');
    err.statusCode = 400;
    err.code = 'CATEGORY_DEFAULT_IMMUTABLE';
    categoryService.deleteCategory.mockRejectedValue(err);

    const res = await request(app).delete('/categories/cat-1');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CATEGORY_DEFAULT_IMMUTABLE');
  });
});
