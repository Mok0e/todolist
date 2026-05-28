'use strict';

// dotenv가 실제 .env 파일을 로드하지 못하도록 모킹
jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('env config', () => {
  const REQUIRED_VARS = {
    DATABASE_URL: 'postgresql://postgres:password@localhost:5432/todolist',
    JWT_SECRET: 'test-jwt-secret',
    PORT: '3000',
    NODE_ENV: 'test',
    BCRYPT_SALT_ROUNDS: '10',
    CORS_ORIGIN: 'http://localhost:5173',
  };

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...REQUIRED_VARS };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('모든 필수 환경변수가 있을 때 정상 export', () => {
    let config;
    jest.isolateModules(() => {
      config = require('../env');
    });

    expect(config.DATABASE_URL).toBe(REQUIRED_VARS.DATABASE_URL);
    expect(config.JWT_SECRET).toBe(REQUIRED_VARS.JWT_SECRET);
    expect(config.NODE_ENV).toBe(REQUIRED_VARS.NODE_ENV);
    expect(config.CORS_ORIGIN).toBe(REQUIRED_VARS.CORS_ORIGIN);
  });

  test('PORT가 number 타입으로 export', () => {
    let config;
    jest.isolateModules(() => {
      config = require('../env');
    });

    expect(typeof config.PORT).toBe('number');
    expect(config.PORT).toBe(3000);
  });

  test('BCRYPT_SALT_ROUNDS가 number 타입으로 export', () => {
    let config;
    jest.isolateModules(() => {
      config = require('../env');
    });

    expect(typeof config.BCRYPT_SALT_ROUNDS).toBe('number');
    expect(config.BCRYPT_SALT_ROUNDS).toBe(10);
  });

  test('DATABASE_URL 누락 시 process.exit(1) 호출', () => {
    delete process.env.DATABASE_URL;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    jest.isolateModules(() => {
      expect(() => require('../env')).toThrow('exit');
    });

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  test('JWT_SECRET 누락 시 process.exit(1) 호출', () => {
    delete process.env.JWT_SECRET;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    jest.isolateModules(() => {
      expect(() => require('../env')).toThrow('exit');
    });

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  test('PORT 누락 시 process.exit(1) 호출', () => {
    delete process.env.PORT;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    jest.isolateModules(() => {
      expect(() => require('../env')).toThrow('exit');
    });

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  test('BCRYPT_SALT_ROUNDS 누락 시 process.exit(1) 호출', () => {
    delete process.env.BCRYPT_SALT_ROUNDS;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    jest.isolateModules(() => {
      expect(() => require('../env')).toThrow('exit');
    });

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
