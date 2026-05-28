'use strict';

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// 인증 불필요
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
