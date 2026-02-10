export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};





