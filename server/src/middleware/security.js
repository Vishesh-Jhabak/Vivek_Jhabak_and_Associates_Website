// Simple recursive helper to sanitize string values by removing HTML tags and scripts
const cleanString = (val) => {
  if (typeof val !== 'string') return val;
  
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove script tags entirely
    .replace(/<[^>]*>/g, '') // Strip remaining HTML tags
    .trim();
};

const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeInput(obj[key]);
      }
    }
  }
  return obj;
};

// Middleware to strip XSS vectors from body, query, and params
const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

module.exports = { xssSanitizer, cleanString };
