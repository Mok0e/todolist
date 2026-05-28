'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'PORT', 'NODE_ENV', 'BCRYPT_SALT_ROUNDS', 'CORS_ORIGIN'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`[env] 필수 환경변수 누락: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10),
  NODE_ENV: process.env.NODE_ENV,
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
