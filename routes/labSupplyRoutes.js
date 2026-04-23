const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSupplies,
  getLowStockAlerts,
  addSupply,
  updateStock,
  deleteSupply
} = require('../controllers/labSupplyController');

// All routes require authentication
router.use(protect);

// Get all supplies for logged-in lab
router.get('/', getSupplies);

// Get low stock alerts
router.get('/low-stock', getLowStockAlerts);

// Add new supply item
router.post('/', addSupply);

// Update supply stock
router.put('/:supplyId/stock', updateStock);

// Delete supply item
router.delete('/:supplyId', deleteSupply);

module.exports = router;
