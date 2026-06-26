const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Login route (rate-limited)
router.post('/login', loginLimiter, login);

// Get current logged-in profile route (JWT protected)
router.get('/me', protect, getMe);

module.exports = router;
