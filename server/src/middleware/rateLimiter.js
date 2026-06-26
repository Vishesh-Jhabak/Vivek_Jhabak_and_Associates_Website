const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Stricter rate limiter for form submissions (Contact, Appointment, Applications)
const formSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 form submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many form submissions from this IP, please try again after an hour',
  },
});

// Stricter rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});

module.exports = { apiLimiter, formSubmitLimiter, loginLimiter };
