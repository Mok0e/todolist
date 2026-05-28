'use strict';

const express = require('express');
const todoController = require('../controllers/todoController');

const router = express.Router();

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.patch('/:id/complete', todoController.completeTodo);
router.patch('/:id/incomplete', todoController.incompleteTodo);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
