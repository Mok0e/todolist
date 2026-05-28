'use strict';

const pool = require('../config/db');
const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { signToken } = require('../utils/jwtUtils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,128}$/;

function makeError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function register({ email, password, name }) {
  if (!EMAIL_REGEX.test(email)) {
    throw makeError('유효하지 않은 이메일 형식입니다.', 400, 'VALIDATION_ERROR');
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw makeError('비밀번호는 8~128자이며 영문과 숫자를 각 1자 이상 포함해야 합니다.', 400, 'AUTH_PASSWORD_WEAK');
  }

  const trimmedName = (name || '').trim();
  if (trimmedName.length < 1 || trimmedName.length > 50) {
    throw makeError('이름은 1~50자여야 합니다.', 400, 'VALIDATION_ERROR');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw makeError('이미 사용 중인 이메일입니다.', 409, 'AUTH_EMAIL_DUPLICATE');
  }

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await userRepository.create(client, { email, passwordHash, name: trimmedName });
    await categoryRepository.createDefault(client, user.id);
    await client.query('COMMIT');
    return { id: user.id, email: user.email, name: user.name };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw makeError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  const match = await comparePassword(password, user.password);
  if (!match) {
    throw makeError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  const accessToken = signToken({ userId: user.id });
  return { accessToken };
}

module.exports = { register, login };
