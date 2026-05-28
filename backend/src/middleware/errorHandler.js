'use strict';

const logger = require('../utils/logger');
const { NODE_ENV } = require('../config/env');

function errorHandler(err, req, res, next) {
  logger.error(err.message || String(err));

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  const body = { error: { code, message } };

  if (NODE_ENV === 'development') {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
