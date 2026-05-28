'use strict';

const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

const pool = new Pool({ connectionString: DATABASE_URL });

pool.on('error', (err) => {
  console.error('[db] 예기치 않은 DB 오류:', err.message);
});

module.exports = pool;
