const PrescriptionTemplate = require('../models/prescriptionTemplate');

// Get all templates for logged-in doctor
exports.getTemplates = async (req, res) => {
  try {
    const templates = await PrescriptionTemplate.find({ doctor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, medicines } = req.body;
    
    const template = await PrescriptionTemplate.create({
      doctor: req.user.id,
      name,
      medicines
    });
    
    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, medicines } = req.body;
    
    const template = await PrescriptionTemplate.findOneAndUpdate(
      { _id: id, doctor: req.user.id },
      { name, medicines },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    res.status(200).json({ success: true, template });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PrescriptionTemplate.findOneAndDelete({
      _id: id,
      doctor: req.user.id
    });
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
};
