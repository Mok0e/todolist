'use strict';

const pool = require('../db');

describe('db pool', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('pool이 export된다', () => {
    expect(pool).toBeDefined();
  });

  test('pool.query 메서드가 존재한다', () => {
    expect(typeof pool.query).toBe('function');
  });

  test('SELECT 1 실제 DB 연결 성공', async () => {
    const result = await pool.query('SELECT 1 AS value');
    expect(result.rows[0].value).toBe(1);
  });
});
