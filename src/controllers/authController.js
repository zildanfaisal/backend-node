import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { apiError, apiSuccess } from "../utils/response.js";

const isValidEmail = (email) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);

export const registerUser = async (req, res, next) => {
  try {
    const { email, first_name, last_name, password } = req.body || {};

    if (!isValidEmail(email)) {
      return apiError(res, 400, 102, "Paramter email tidak sesuai format");
    }
    if (!password || password.length < 6) {
      return apiError(res, 400, 102, "Paramter password tidak sesuai format");
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      // Treat as bad request per typical API (not specified explicitly in spec)
      return apiError(res, 400, 102, "Email sudah terdaftar");
    }

    const hashed = await bcrypt.hash(password, 10);
    await createUser({ email, first_name, last_name, password: hashed });

    return apiSuccess(res, "Registrasi berhasil silahkan login", null, 200);
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email)) {
      return apiError(res, 400, 102, "Paramter email tidak sesuai format");
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return apiError(res, 401, 103, "Username atau password salah");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return apiError(res, 401, 103, "Username atau password salah");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return apiSuccess(res, "Login Sukses", { token }, 200);
  } catch (error) {
    return next(error);
  }
};
