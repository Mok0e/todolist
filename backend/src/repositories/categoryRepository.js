'use strict';

async function createDefault(client, userId) {
  const result = await client.query(
    "INSERT INTO categories (user_id, name, is_default) VALUES ($1, '기본', TRUE) RETURNING id, name, is_default",
    [userId]
  );
  return result.rows[0];
}

module.exports = { createDefault };
