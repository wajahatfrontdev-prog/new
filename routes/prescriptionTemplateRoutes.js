const express = require('express');
const router = express.Router();
const prescriptionTemplateController = require('../controllers/prescriptionTemplateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, prescriptionTemplateController.getTemplates);
router.post('/', protect, prescriptionTemplateController.createTemplate);
router.put('/:id', protect, prescriptionTemplateController.updateTemplate);
router.delete('/:id', protect, prescriptionTemplateController.deleteTemplate);

module.exports = router;
