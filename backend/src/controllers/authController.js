'use strict';

const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const data = await authService.register({ email, password, name });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
