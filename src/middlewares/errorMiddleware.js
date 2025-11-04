import { apiError } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  const isAuthError = err.name === "UnauthorizedError" || err.code === 108;
  const isValidation = err.code === 102;

  const httpCode = isAuthError ? 401 : isValidation ? 400 : err.httpCode || 400;
  const code = isAuthError ? 108 : isValidation ? 102 : err.code || 102;
  const message =
    err.message ||
    (isAuthError ? "Token tidak tidak valid atau kadaluwarsa" : "Bad request");

  if (process.env.NODE_ENV !== "test") {
    console.error("Error:", { httpCode, code, message, stack: err.stack });
  }

  return apiError(res, httpCode, code, message);
};
