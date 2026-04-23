const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCart, addItem, updateItem, clearCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/items', protect, addItem);
router.put('/items', protect, updateItem);
router.delete('/', protect, clearCart);

module.exports = router;
