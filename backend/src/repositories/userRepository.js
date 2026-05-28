'use strict';

const pool = require('../config/db');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password, name, theme, language, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, email, password, name, theme, language, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create(client, { email, passwordHash, name }) {
  const result = await client.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, passwordHash, name]
  );
  return result.rows[0];
}

async function update(id, { name, passwordHash }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (passwordHash !== undefined) {
    fields.push(`password = $${idx++}`);
    values.push(passwordHash);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, name`,
    values
  );
  return result.rows[0];
}

async function updateSettings(id, { theme, language }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (theme !== undefined) {
    fields.push(`theme = $${idx++}`);
    values.push(theme);
  }
  if (language !== undefined) {
    fields.push(`language = $${idx++}`);
    values.push(language);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING theme, language`,
    values
  );
  return result.rows[0];
}

async function deleteById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, findById, create, update, updateSettings, deleteById };
