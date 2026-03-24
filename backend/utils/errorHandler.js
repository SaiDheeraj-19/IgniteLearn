/**
 * Centralized Express error handler.
 * Catches all errors thrown via next(err) and returns structured JSON.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  if (isDev) console.error(err.stack);

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
    ...(isDev && { stack: err.stack }),
  });
};

/**
 * Creates a structured API error.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

module.exports = { errorHandler, AppError };
