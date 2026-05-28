'use strict';

const bcrypt = require('bcrypt');
const { BCRYPT_SALT_ROUNDS } = require('../config/env');

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, comparePassword };
