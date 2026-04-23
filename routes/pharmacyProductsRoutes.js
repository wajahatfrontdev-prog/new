const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createMedicine, updateMedicine, deleteMedicine, getMedicineById, listMedicines } = require('../controllers/pharmacyProductController');

const router = express.Router();

router.get('/', listMedicines);
router.get('/:id', getMedicineById);
router.post('/', protect, createMedicine);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, deleteMedicine);

module.exports = router;
