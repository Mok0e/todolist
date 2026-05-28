'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../../utils/jwtUtils', () => ({
  verifyToken: jest.fn(),
}));

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/todolist_test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_SALT_ROUNDS = '1';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const { verifyToken } = require('../../utils/jwtUtils');
const auth = require('../auth');

const mockReq = (headers = {}) => ({ headers });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('Authorization 헤더가 없을 때 401 AUTH_TOKEN_MISSING을 반환한다', () => {
    const req = mockReq({});
    const res = mockRes();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'AUTH_TOKEN_MISSING', message: '인증 토큰이 없습니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("Authorization이 'Bearer '로 시작하지 않을 때 401 AUTH_TOKEN_MISSING을 반환한다", () => {
    const req = mockReq({ authorization: 'Token abc123' });
    const res = mockRes();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'AUTH_TOKEN_MISSING', message: '인증 토큰이 없습니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('만료된 토큰일 때 401 AUTH_TOKEN_EXPIRED를 반환한다', () => {
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    verifyToken.mockImplementation(() => { throw expiredError; });

    const req = mockReq({ authorization: 'Bearer expired.token.here' });
    const res = mockRes();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'AUTH_TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('잘못된 토큰 문자열일 때 401 AUTH_TOKEN_INVALID를 반환한다', () => {
    const invalidError = new Error('invalid signature');
    invalidError.name = 'JsonWebTokenError';
    verifyToken.mockImplementation(() => { throw invalidError; });

    const req = mockReq({ authorization: 'Bearer invalid.token.string' });
    const res = mockRes();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'AUTH_TOKEN_INVALID', message: '유효하지 않은 토큰입니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('유효한 토큰일 때 req.userId를 설정하고 next()를 호출한다', () => {
    verifyToken.mockReturnValue({ userId: 7 });

    const req = mockReq({ authorization: 'Bearer valid.token.here' });
    const res = mockRes();

    auth(req, res, next);

    expect(req.userId).toBe(7);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Bearer 뒤에 빈 문자열일 때 401 AUTH_TOKEN_INVALID를 반환한다", () => {
    const invalidError = new Error('jwt must be provided');
    invalidError.name = 'JsonWebTokenError';
    verifyToken.mockImplementation(() => { throw invalidError; });

    const req = mockReq({ authorization: 'Bearer ' });
    const res = mockRes();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'AUTH_TOKEN_INVALID', message: '유효하지 않은 토큰입니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
