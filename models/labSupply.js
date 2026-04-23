const mongoose = require('mongoose');

const labSupplySchema = new mongoose.Schema({
  laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  itemName: { type: String, required: true },
  category: { type: String, enum: ['Reagent', 'Equipment', 'Consumable', 'Other'], default: 'Other' },
  currentStock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 10 },
  unit: { type: String, default: 'units' }, // units, ml, boxes, etc.
  supplier: String,
  lastRestocked: Date,
  expiryDate: Date,
  notes: String
}, { timestamps: true });

// Virtual for low stock alert
labSupplySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minStockLevel;
});

labSupplySchema.set('toJSON', { virtuals: true });
labSupplySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LabSupply', labSupplySchema);
