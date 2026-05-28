'use strict';

const todoRepository = require('../repositories/todoRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { calculateStatus } = require('../utils/statusCalculator');

function makeError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function toDTO(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    status: calculateStatus(row),
    startDate: row.start_date || null,
    endDate: row.end_date || null,
    category: {
      id: row.category_id,
      name: row.category_name,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    throw makeError(400, 'VALIDATION_ERROR', '할 일 제목은 필수입니다.');
  }
  if (title.length > 100) {
    throw makeError(400, 'TODO_TITLE_TOO_LONG', '제목은 100자 이내여야 합니다.');
  }
}

function validateDates(startDate, endDate) {
  if (startDate && endDate && endDate < startDate) {
    throw makeError(400, 'TODO_DATE_INVALID', '종료일은 시작일 이후여야 합니다.');
  }
}

async function getTodos(userId, { status, categoryId, dueDateFrom, dueDateTo } = {}) {
  const rows = await todoRepository.findByUserId(userId, { categoryId, dueDateFrom, dueDateTo });
  let dtos = rows.map(toDTO);
  if (status) {
    dtos = dtos.filter(dto => dto.status === status);
  }
  return dtos;
}

async function createTodo(userId, { title, description, categoryId, startDate, endDate }) {
  validateTitle(title);
  if (description && description.length > 1000) {
    throw makeError(400, 'TODO_DESC_TOO_LONG', '설명은 1000자 이내여야 합니다.');
  }
  validateDates(startDate, endDate);

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const defaultCat = await categoryRepository.findDefaultByUserId(userId);
    resolvedCategoryId = defaultCat.id;
  }

  const created = await todoRepository.create(userId, {
    categoryId: resolvedCategoryId,
    title: title.trim(),
    description,
    startDate,
    endDate,
  });

  const row = await todoRepository.findById(created.id);
  return toDTO(row);
}

async function updateTodo(userId, todoId, fields) {
  const existing = await todoRepository.findById(todoId);
  if (!existing) {
    throw makeError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  if (existing.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }

  const { title, description, startDate, endDate } = fields;

  if (title !== undefined) validateTitle(title);
  if (description !== undefined && description !== null && description.length > 1000) {
    throw makeError(400, 'TODO_DESC_TOO_LONG', '설명은 1000자 이내여야 합니다.');
  }

  const newStartDate = startDate !== undefined ? startDate : existing.start_date;
  const newEndDate = endDate !== undefined ? endDate : existing.end_date;
  validateDates(newStartDate, newEndDate);

  await todoRepository.update(todoId, fields);
  const row = await todoRepository.findById(todoId);
  return toDTO(row);
}

async function deleteTodo(userId, todoId) {
  const existing = await todoRepository.findById(todoId);
  if (!existing) {
    throw makeError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  if (existing.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }
  await todoRepository.deleteById(todoId);
  return {};
}

async function completeTodo(userId, todoId) {
  const existing = await todoRepository.findById(todoId);
  if (!existing) {
    throw makeError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  if (existing.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }
  await todoRepository.setStatus(todoId, 'DONE');
  const row = await todoRepository.findById(todoId);
  return toDTO(row);
}

async function incompleteTodo(userId, todoId) {
  const existing = await todoRepository.findById(todoId);
  if (!existing) {
    throw makeError(404, 'TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.');
  }
  if (existing.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }
  await todoRepository.setStatus(todoId, null);
  const row = await todoRepository.findById(todoId);
  return toDTO(row);
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo, completeTodo, incompleteTodo };
