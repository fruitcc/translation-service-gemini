const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.name === 'ValidationError' ? 400 :
    err.name === 'UnauthorizedError' ? 401 :
    err.statusCode || 500;

  const logContext = {
    statusCode,
    message: err.message,
    details: err.details,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Full stack traces only for unexpected server errors (5xx). Expected client
  // errors (validation, CORS) log a concise one-liner so real problems stand out.
  if (statusCode >= 500) {
    console.error('Server error:', { ...logContext, stack: err.stack });
  } else {
    console.warn('Client error:', logContext);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: err.details || err.message,
      },
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized access',
        details: err.message,
      },
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || null,
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
  });
};

module.exports = errorHandler;