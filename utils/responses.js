// Standard response helpers
export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (
  res,
  message = "Internal Server Error",
  statusCode = 500,
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "A validação falhou",
    errors: errors.array(),
    timestamp: new Date().toISOString(),
  });
};

export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const forbiddenResponse = (res, message = "Forbidden") => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const conflictResponse = (res, message = "Resource already exists") => {
  return res.status(409).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
