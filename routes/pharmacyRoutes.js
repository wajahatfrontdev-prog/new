const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { AddPharmacyDetails, getAllPharmacy, getPharmacyById, getPharmacyProfile, getTopSellingProducts } = require('../controllers/pharmacyController');

const router = express.Router();

router.get('/profile', protect, getPharmacyProfile);
router.get('/top-selling', protect, getTopSellingProducts);
router.post('/add_pharmacy_details', protect, AddPharmacyDetails);
router.get('/get_all_pharmacy', getAllPharmacy);
router.get('/:id', getPharmacyById);

module.exports = router;
