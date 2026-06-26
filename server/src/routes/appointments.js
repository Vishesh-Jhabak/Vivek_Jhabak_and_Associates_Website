const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { formSubmitLimiter } = require('../middleware/rateLimiter');

// Public route to book appointment (rate-limited)
router.post('/', formSubmitLimiter, createAppointment);

// Admin-only routes to get, update status, or delete appointments
router.get('/', protect, authorize('admin'), getAppointments);
router.put('/:id', protect, authorize('admin'), updateAppointment);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
