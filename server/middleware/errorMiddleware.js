const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message;
  let errors = [];

  if (err.name === 'CorsError' || err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed by CORS' });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    message = errors.map(e => e.message).join(', ');
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}`, err);
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: isProduction ? undefined : err.stack
  });
};

module.exports = errorHandler;
