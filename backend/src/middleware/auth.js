'use strict';

const { verifyToken } = require('../utils/jwtUtils');

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'AUTH_TOKEN_MISSING', message: '인증 토큰이 없습니다.' },
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'AUTH_TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' },
      });
    }
    return res.status(401).json({
      error: { code: 'AUTH_TOKEN_INVALID', message: '유효하지 않은 토큰입니다.' },
    });
  }
}

module.exports = auth;
