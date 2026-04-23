const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { AddPaitentsDetails, getAllPaitent, getPatientById, getMyPatientProfile } = require('../controllers/patientController');

const router = express.Router();

router.post('/add_patient_details', protect, AddPaitentsDetails)
router.post('/add_paitent_details', protect, AddPaitentsDetails)
router.get('/get_all_patients', getAllPaitent)
router.get('/me', protect, getMyPatientProfile)
router.get('/:id', getPatientById)
module.exports = router;
