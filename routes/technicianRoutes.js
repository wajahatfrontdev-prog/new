const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

// Technician management
router.post('/:labId/technicians', technicianController.addTechnician);
router.get('/:labId/technicians', technicianController.getTechnicians);
router.get('/:labId/technicians/available', technicianController.getAvailableTechnicians);
router.get('/technicians/:id', technicianController.getTechnicianById);
router.put('/technicians/:id', technicianController.updateTechnician);
router.delete('/technicians/:id', technicianController.deleteTechnician);
router.get('/technicians/:id/performance', technicianController.getTechnicianPerformance);

// Assignment
router.post('/bookings/:bookingId/assign-technician', technicianController.assignTechnician);

module.exports = router;
