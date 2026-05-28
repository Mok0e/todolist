'use strict';

const categoryService = require('../services/categoryService');

async function listCategories(req, res, next) {
  try {
    const data = await categoryService.listCategories(req.userId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    const data = await categoryService.createCategory(req.userId, { name });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const data = await categoryService.updateCategory(req.userId, id, { name });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const data = await categoryService.deleteCategory(req.userId, id);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
