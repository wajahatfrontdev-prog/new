const Instructor = require('../models/instructor');
const InstructorPrecaution = require('../models/instructorPrecaution');

exports.createPrecaution = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) return res.status(403).json({ message: 'Instructor profile not found' });
    const { title, body, attachments } = req.body;
    const prec = await InstructorPrecaution.create({
      instructor: instructor._id,
      title,
      body,
      attachments: Array.isArray(attachments) ? attachments : []
    });
    res.status(201).json({ success: true, precaution: prec });
  } catch (error) {
    console.error('Create Precaution Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.listPrecautions = async (req, res) => {
  try {
    const { instructorId } = req.query;
    const filter = {};
    if (instructorId) filter.instructor = instructorId;
    const list = await InstructorPrecaution.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: list.length, precautions: list });
  } catch (error) {
    console.error('List Precautions Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getPrecautionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prec = await InstructorPrecaution.findById(id);
    if (!prec) return res.status(404).json({ message: 'Precaution not found' });
    res.status(200).json({ success: true, precaution: prec });
  } catch (error) {
    console.error('Get Precaution Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updatePrecaution = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) return res.status(403).json({ message: 'Instructor profile not found' });
    const prec = await InstructorPrecaution.findById(id);
    if (!prec) return res.status(404).json({ message: 'Precaution not found' });
    if (prec.instructor.toString() !== instructor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this item' });
    }
    const updated = await InstructorPrecaution.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ success: true, precaution: updated });
  } catch (error) {
    console.error('Update Precaution Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deletePrecaution = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) return res.status(403).json({ message: 'Instructor profile not found' });
    const prec = await InstructorPrecaution.findById(id);
    if (!prec) return res.status(404).json({ message: 'Precaution not found' });
    if (prec.instructor.toString() !== instructor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    await InstructorPrecaution.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Precaution deleted' });
  } catch (error) {
    console.error('Delete Precaution Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
