const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // PostgreSQL / Supabase invalid UUID format (22P02)
  if (err.code === '22P02') {
    const message = 'Invalid resource identifier format';
    error = new Error(message);
    error.statusCode = 400;
  }

  // PostgreSQL / Supabase unique violation (23505)
  if (err.code === '23505') {
    const detail = err.detail || '';
    const match = detail.match(/\((.*?)\)=\((.*?)\)/);
    const field = match ? match[1] : 'field';
    const message = `Duplicate value entered for ${field}. Please choose another value.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // PostgreSQL / Supabase foreign key violation (23503)
  if (err.code === '23503') {
    const message = 'The referenced relationship item does not exist';
    error = new Error(message);
    error.statusCode = 404;
  }

  // Multer error (File upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Max limit is 5MB.';
    }
    error = new Error(message);
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
