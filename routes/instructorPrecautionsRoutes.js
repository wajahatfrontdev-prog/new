const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createPrecaution, listPrecautions, getPrecautionById, updatePrecaution, deletePrecaution } = require('../controllers/instructorPrecautionController');

const router = express.Router();

router.get('/', listPrecautions);
router.get('/:id', getPrecautionById);
router.post('/', protect, createPrecaution);
router.put('/:id', protect, updatePrecaution);
router.delete('/:id', protect, deletePrecaution);

module.exports = router;
