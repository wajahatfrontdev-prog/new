const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  productName: String,
  price: Number,
  quantity: Number
}, { _id: false });

const prescriptionItemSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  price: Number,
}, { _id: false });

const pharmacyOrderSchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  prescriptionItems: [prescriptionItemSchema],
  totalAmount: Number,
  deliveryOption: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
  address: String,
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'], default: 'pending' },
  cancelledAt: Date,
  cancellationReason: String,
  orderNumber: { type: String, unique: true },
  medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  prescriptionText: String,
  orderType: { type: String, enum: ['cart', 'prescription'], default: 'cart' },
}, { timestamps: true });

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
