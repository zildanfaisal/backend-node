import bcrypt from "bcrypt";
import {
  createUser,
  findAllUsers,
  findUserByEmail,
} from "../models/userModel.js";
import pool from "../config/db.js";
import { successResponse } from "../utils/response.js";

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const users = await findAllUsers(limit, offset);
    successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashedPassword);
    successResponse(res, newUser, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), password = COALESCE($2, password) WHERE id = $3 RETURNING id, name, email",
      [name, hashedPassword, id]
    );

    if (result.rowCount === 0) throw new Error("User not found");
    successResponse(res, result.rows[0], "User updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) throw new Error("User not found");
    successResponse(res, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
