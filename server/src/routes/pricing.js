const express = require('express');
const router = express.Router();
const {
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
} = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/auth');

// Public route to retrieve pricing tiers
router.get('/', getPricing);

// Admin-only CRUD routes for pricing tiers
router.post('/', protect, authorize('admin'), createPricing);
router.put('/:id', protect, authorize('admin'), updatePricing);
router.delete('/:id', protect, authorize('admin'), deletePricing);

module.exports = router;
