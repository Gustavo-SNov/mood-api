export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    statusCode: 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.message = 'Resource already exists';
    error.statusCode = 409;
  }

  // Custom errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};