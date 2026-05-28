'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

const validate = require('../validate');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validate middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  test('validator가 null을 반환하면 next()를 호출한다', () => {
    const validatorFn = jest.fn().mockReturnValue(null);
    const middleware = validate(validatorFn);

    const req = { body: {}, params: {}, query: {} };
    const res = mockRes();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('validator가 { message } 반환 시 400 VALIDATION_ERROR로 응답한다', () => {
    const validatorFn = jest.fn().mockReturnValue({ message: '필드가 누락되었습니다.' });
    const middleware = validate(validatorFn);

    const req = { body: {}, params: {}, query: {} };
    const res = mockRes();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: '필드가 누락되었습니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('validator가 { code, message } 반환 시 400 + 커스텀 code로 응답한다', () => {
    const validatorFn = jest.fn().mockReturnValue({
      code: 'TITLE_REQUIRED',
      message: '제목은 필수입니다.',
    });
    const middleware = validate(validatorFn);

    const req = { body: {}, params: {}, query: {} };
    const res = mockRes();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'TITLE_REQUIRED', message: '제목은 필수입니다.' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('validator에 req.body, req.params, req.query가 순서대로 전달된다', () => {
    const validatorFn = jest.fn().mockReturnValue(null);
    const middleware = validate(validatorFn);

    const body = { title: 'test' };
    const params = { id: '1' };
    const query = { page: '1' };
    const req = { body, params, query };
    const res = mockRes();

    middleware(req, res, next);

    expect(validatorFn).toHaveBeenCalledWith(body, params, query);
  });
});
