const mongoose = require('mongoose');

const testCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Blood',
      'Imaging',
      'Pathology',
      'Urine',
      'Stool',
      'Hormone',
      'Vitamin',
      'Cardiac',
      'Diabetes',
      'Liver Function',
      'Kidney Function',
      'Thyroid',
      'Other'
    ]
  },
  standardPrice: {
    type: Number,
    required: [true, 'Standard price is required'],
    min: [0, 'Price cannot be negative']
  },
  preparationInstructions: {
    type: String,
    default: 'No special preparation required'
  },
  estimatedTime: {
    type: Number, // in hours
    default: 24,
    min: [1, 'Estimated time must be at least 1 hour']
  },
  requiredEquipment: [{
    type: String
  }],
  normalRanges: {
    type: Map,
    of: {
      min: Number,
      max: Number,
      unit: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  sampleType: {
    type: String,
    enum: ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Other'],
    default: 'Blood'
  }
}, {
  timestamps: true
});

// Index for faster searches
testCatalogSchema.index({ name: 'text', category: 1 });
testCatalogSchema.index({ isActive: 1, category: 1 });
testCatalogSchema.index({ popularity: -1 });

module.exports = mongoose.model('TestCatalog', testCatalogSchema);
