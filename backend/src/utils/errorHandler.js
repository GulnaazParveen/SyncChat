const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message =
    err instanceof ApiError ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null, // Include errors array if provided
  });
};

// Use this middleware in your Express app
app.use(errorHandler);
