'use strict';

const todoService = require('../services/todoService');

async function getTodos(req, res, next) {
  try {
    const { status, categoryId, dueDateFrom, dueDateTo } = req.query;
    const data = await todoService.getTodos(req.userId, { status, categoryId, dueDateFrom, dueDateTo });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const { title, description, categoryId, startDate, endDate } = req.body;
    const data = await todoService.createTodo(req.userId, { title, description, categoryId, startDate, endDate });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, categoryId, startDate, endDate } = req.body;
    const data = await todoService.updateTodo(req.userId, id, { title, description, categoryId, startDate, endDate });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;
    const data = await todoService.deleteTodo(req.userId, id);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function completeTodo(req, res, next) {
  try {
    const { id } = req.params;
    const data = await todoService.completeTodo(req.userId, id);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

async function incompleteTodo(req, res, next) {
  try {
    const { id } = req.params;
    const data = await todoService.incompleteTodo(req.userId, id);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, completeTodo, incompleteTodo };
