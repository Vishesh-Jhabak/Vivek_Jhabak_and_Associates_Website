const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { formSubmitLimiter } = require('../middleware/rateLimiter');

// Public route to submit contact forms (rate-limited)
router.post('/', formSubmitLimiter, submitContactForm);

// Admin-only message management routes
router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id', protect, authorize('admin'), updateMessageStatus);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
