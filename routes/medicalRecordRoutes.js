const express = require('express');
const {
    createMedicalRecord,
    getPatientRecords,
    getDoctorRecords,
    updateMedicalRecord,
    getRecordById,
    getMyRecords
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createMedicalRecord);
router.get('/patient/:patientId', protect, getPatientRecords);
router.get('/my-records', protect, getMyRecords);
router.get('/doctor', protect, getDoctorRecords);
router.put('/:recordId', protect, updateMedicalRecord);
router.get('/:recordId', protect, getRecordById);

module.exports = router;
