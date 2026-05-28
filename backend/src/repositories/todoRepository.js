'use strict';

const pool = require('../config/db');

const TODO_SELECT = `
  SELECT t.id, t.user_id, t.category_id, c.name AS category_name,
         t.title, t.description, t.status,
         to_char(t.start_date, 'YYYY-MM-DD') AS start_date,
         to_char(t.end_date, 'YYYY-MM-DD') AS end_date,
         t.created_at, t.updated_at
  FROM todos t
  JOIN categories c ON t.category_id = c.id
`;

async function findByUserId(userId, { categoryId, dueDateFrom, dueDateTo } = {}) {
  const conditions = ['t.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (categoryId) {
    conditions.push(`t.category_id = $${idx++}`);
    values.push(categoryId);
  }
  if (dueDateFrom) {
    conditions.push(`t.end_date >= $${idx++}`);
    values.push(dueDateFrom);
  }
  if (dueDateTo) {
    conditions.push(`t.end_date <= $${idx++}`);
    values.push(dueDateTo);
  }

  const { rows } = await pool.query(
    `${TODO_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY t.created_at DESC`,
    values
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `${TODO_SELECT} WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(userId, { categoryId, title, description, startDate, endDate }) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [userId, categoryId, title, description || null, startDate || null, endDate || null]
  );
  return rows[0];
}

async function update(id, fields) {
  const sets = [];
  const values = [];
  let idx = 1;

  if (fields.title !== undefined) { sets.push(`title = $${idx++}`); values.push(fields.title); }
  if (fields.description !== undefined) { sets.push(`description = $${idx++}`); values.push(fields.description); }
  if (fields.categoryId !== undefined) { sets.push(`category_id = $${idx++}`); values.push(fields.categoryId); }
  if (fields.startDate !== undefined) { sets.push(`start_date = $${idx++}`); values.push(fields.startDate); }
  if (fields.endDate !== undefined) { sets.push(`end_date = $${idx++}`); values.push(fields.endDate); }

  if (sets.length === 0) return null;

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE todos SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id`,
    values
  );
  return rows[0] || null;
}

async function setStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE todos SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
    [status, id]
  );
  return rows[0] || null;
}

async function deleteById(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

module.exports = { findByUserId, findById, create, update, setStatus, deleteById };
