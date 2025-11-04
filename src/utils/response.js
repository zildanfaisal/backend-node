// API response helpers aligned with the assignment spec
// Success: { status: 0, message: string, data: any }
// Error:   { status: code, message: string, data: null }

export const apiSuccess = (
  res,
  message = "Sukses",
  data = null,
  httpCode = 200
) => {
  return res.status(httpCode).json({
    status: 0,
    message,
    data,
  });
};

// Common error codes used in the spec
// 102: Bad Request (validation/format)
// 103: Unauthorized (username/password salah)
// 108: Unauthorized (token invalid/expired)
export const apiError = (
  res,
  httpCode = 400,
  code = 102,
  message = "Bad request"
) => {
  return res.status(httpCode).json({
    status: code,
    message,
    data: null,
  });
};

// Backward compatibility wrappers (if any legacy code still calls these)
export const successResponse = (res, data, message = "Success") => {
  return apiSuccess(res, message, data, 200);
};

export const errorResponse = (res, message = "Error", statusCode = 400) => {
  return apiError(res, statusCode, 102, message);
};
