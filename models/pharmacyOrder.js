const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  productName: String,
  price: Number,
  quantity: Number
}, { _id: false });

const pharmacyOrderSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: Number,
  deliveryOption: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
  address: String,
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'], default: 'pending' },
  cancelledAt: Date,
  cancellationReason: String,
  orderNumber: { type: String, unique: true },
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  prescriptionText: String,
}, { timestamps: true });

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
