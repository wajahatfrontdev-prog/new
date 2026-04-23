const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createFromCart, getMyOrders, getPharmacyOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/pharmacyOrderController');

const router = express.Router();

router.post('/', protect, createFromCart);
router.get('/my', protect, getMyOrders);
router.get('/pharmacy/list', protect, getPharmacyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
