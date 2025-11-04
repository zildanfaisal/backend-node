import pool from "../config/db.js";

export const createUser = async ({
  email,
  first_name,
  last_name,
  password,
}) => {
  const result = await pool.query(
    `INSERT INTO users (email, first_name, last_name, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name, profile_image, balance`,
    [email, first_name, last_name, password]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, email, first_name, last_name, profile_image, balance FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateUserNames = async (id, first_name, last_name) => {
  const result = await pool.query(
    `UPDATE users
     SET first_name = COALESCE($2, first_name),
         last_name = COALESCE($3, last_name)
     WHERE id = $1
     RETURNING id, email, first_name, last_name, profile_image, balance`,
    [id, first_name, last_name]
  );
  return result.rows[0];
};

export const updateUserProfileImage = async (id, profile_image) => {
  const result = await pool.query(
    `UPDATE users SET profile_image = $2 WHERE id = $1
     RETURNING id, email, first_name, last_name, profile_image, balance`,
    [id, profile_image]
  );
  return result.rows[0];
};

export const getBalanceByUserId = async (id) => {
  const result = await pool.query("SELECT balance FROM users WHERE id = $1", [
    id,
  ]);
  return result.rows[0]?.balance ?? 0;
};

export const findAllUsers = async (limit = 10, offset = 0) => {
  const result = await pool.query(
    "SELECT id, email, first_name, last_name FROM users LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
};
