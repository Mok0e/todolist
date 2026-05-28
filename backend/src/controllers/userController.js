'use strict';

const userService = require('../services/userService');

async function getMe(req, res, next) {
  try {
    const data = await userService.getMe(req.userId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const data = await userService.updateMe(req.userId, req.body);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const data = await userService.deleteMe(req.userId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
