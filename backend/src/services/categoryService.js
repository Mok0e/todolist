'use strict';

const pool = require('../config/db');
const categoryRepository = require('../repositories/categoryRepository');

function toDTO(row) {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function makeError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function listCategories(userId) {
  const rows = await categoryRepository.findByUserId(userId);
  return rows.map(toDTO);
}

async function createCategory(userId, { name }) {
  if (!name || name.trim().length === 0) {
    throw makeError(400, 'VALIDATION_ERROR', '카테고리 이름은 필수입니다.');
  }
  if (name.length > 30) {
    throw makeError(400, 'CATEGORY_NAME_TOO_LONG', '카테고리 이름은 30자 이내여야 합니다.');
  }
  const existing = await categoryRepository.findByNameForUser(userId, name);
  if (existing) {
    throw makeError(409, 'CATEGORY_NAME_DUPLICATE', '이미 존재하는 카테고리 이름입니다.');
  }
  const row = await categoryRepository.create(userId, name);
  return toDTO(row);
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw makeError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
  if (category.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }
  if (category.is_default) {
    throw makeError(400, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 수정할 수 없습니다.');
  }
  if (name && name.length > 30) {
    throw makeError(400, 'CATEGORY_NAME_TOO_LONG', '카테고리 이름은 30자 이내여야 합니다.');
  }
  if (name) {
    const duplicate = await categoryRepository.findByNameForUser(userId, name);
    if (duplicate && duplicate.id !== categoryId) {
      throw makeError(409, 'CATEGORY_NAME_DUPLICATE', '이미 존재하는 카테고리 이름입니다.');
    }
  }
  const row = await categoryRepository.update(categoryId, name);
  return toDTO(row);
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw makeError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
  if (category.user_id !== userId) {
    throw makeError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  }
  if (category.is_default) {
    throw makeError(400, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 삭제할 수 없습니다.');
  }
  const defaultCategory = await categoryRepository.findDefaultByUserId(userId);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await categoryRepository.moveTodosToCategory(client, categoryId, defaultCategory.id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  await categoryRepository.deleteById(categoryId);
  return {};
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
