'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const BASE_ENV = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/todolist_test',
  JWT_SECRET: 'test-secret',
  PORT: '3000',
  NODE_ENV: 'test',
  BCRYPT_SALT_ROUNDS: '1',
  CORS_ORIGIN: 'http://localhost:5173',
};

const mockReq = () => ({});
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('errorHandler middleware', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  test('statusCode와 code가 있는 에러는 해당 statusCode로 응답한다', () => {
    process.env = { ...BASE_ENV };
    let errorHandler;
    jest.isolateModules(() => {
      errorHandler = require('../errorHandler');
    });

    const err = new Error('Not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND', message: 'Not found' }),
      })
    );
  });

  test('statusCode와 code가 없는 일반 Error는 500 INTERNAL_SERVER_ERROR로 응답한다', () => {
    process.env = { ...BASE_ENV };
    let errorHandler;
    jest.isolateModules(() => {
      errorHandler = require('../errorHandler');
    });

    const err = new Error('Unexpected crash');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }),
      })
    );
  });

  test('NODE_ENV=development일 때 응답에 stack이 포함된다', () => {
    process.env = { ...BASE_ENV, NODE_ENV: 'development' };
    let errorHandler;
    jest.isolateModules(() => {
      errorHandler = require('../errorHandler');
    });

    const err = new Error('Dev error');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    const body = res.json.mock.calls[0][0];
    expect(body.error.stack).toBeDefined();
    expect(typeof body.error.stack).toBe('string');
  });

  test('NODE_ENV=production일 때 응답에 stack이 포함되지 않는다', () => {
    process.env = { ...BASE_ENV, NODE_ENV: 'production' };
    let errorHandler;
    jest.isolateModules(() => {
      errorHandler = require('../errorHandler');
    });

    const err = new Error('Prod error');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    const body = res.json.mock.calls[0][0];
    expect(body.error.stack).toBeUndefined();
  });

  test('err.code가 없을 때 응답 body의 code는 INTERNAL_SERVER_ERROR다', () => {
    process.env = { ...BASE_ENV };
    let errorHandler;
    jest.isolateModules(() => {
      errorHandler = require('../errorHandler');
    });

    const err = new Error('서버 내부 오류가 발생했습니다.');
    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
