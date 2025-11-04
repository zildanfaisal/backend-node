import jwt from "jsonwebtoken";
import { apiError } from "../utils/response.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return apiError(
        res,
        401,
        108,
        "Token tidak tidak valid atau kadaluwarsa"
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    return next();
  } catch (error) {
    return apiError(res, 401, 108, "Token tidak tidak valid atau kadaluwarsa");
  }
};
