'use strict';

const pool = require('../config/db');

async function createDefault(client, userId) {
  const result = await client.query(
    "INSERT INTO categories (user_id, name, is_default) VALUES ($1, '기본', TRUE) RETURNING id, name, is_default",
    [userId]
  );
  return result.rows[0];
}

async function findByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, is_default, created_at, updated_at FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, user_id, name, is_default, created_at, updated_at FROM categories WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findByNameForUser(userId, name) {
  const { rows } = await pool.query(
    'SELECT id, name, is_default FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
    [userId, name]
  );
  return rows[0] || null;
}

async function create(userId, name) {
  const { rows } = await pool.query(
    'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id, name, is_default, created_at, updated_at',
    [userId, name]
  );
  return rows[0];
}

async function update(id, name) {
  const { rows } = await pool.query(
    'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_default, created_at, updated_at',
    [name, id]
  );
  return rows[0] || null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

async function findDefaultByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, is_default FROM categories WHERE user_id = $1 AND is_default = TRUE',
    [userId]
  );
  return rows[0] || null;
}

async function moveTodosToCategory(client, fromCategoryId, toCategoryId) {
  await client.query(
    'UPDATE todos SET category_id = $1 WHERE category_id = $2',
    [toCategoryId, fromCategoryId]
  );
}

module.exports = {
  createDefault,
  findByUserId,
  findById,
  findByNameForUser,
  create,
  update,
  deleteById,
  findDefaultByUserId,
  moveTodosToCategory,
};
