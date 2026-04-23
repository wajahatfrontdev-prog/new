const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  productName: { type: String, required: true },
  companyName: String,
  brand: String,
  category: String,
  medicineType: String,
  power: String,
  details: String,
  precautions: String,
  price: { type: Number, required: true },
  amount: String,
  quantity: { type: Number, default: 0 },
  expiry: Date,
  deliveryOption: { type: String, enum: ['pickup', 'delivery', 'both'], default: 'both' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
