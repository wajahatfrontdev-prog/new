const mongoose = require('mongoose');

const icdCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
}, { timestamps: true });

// Text index for search
icdCodeSchema.index({ code: 'text', description: 'text' });

module.exports = mongoose.model('ICDCode', icdCodeSchema);
