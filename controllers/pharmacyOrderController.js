const Cart = require('../models/cart');
const Medicine = require('../models/medicine');
const Pharmacy = require('../models/pharmacy');
const PharmacyOrder = require('../models/pharmacyOrder');

const makeOrderNumber = () => {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PO-${Date.now().toString().slice(-6)}-${part}`;
};

exports.createFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pharmacyId, deliveryOption, address } = req.body;
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    const cart = await Cart.findOne({ user: userId }).populate('items.medicine');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const items = cart.items.map(i => ({
      medicine: i.medicine._id,
      productName: i.medicine.productName,
      price: i.medicine.price,
      quantity: i.quantity
    }));
    const totalAmount = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const order = await PharmacyOrder.create({
      pharmacy: pharmacyId,
      user: userId,
      items,
      totalAmount,
      deliveryOption: deliveryOption || 'delivery',
      address: address || '',
      orderNumber: makeOrderNumber()
    });
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    const filter = { user: userId };
    if (status) filter.status = status;
    const orders = await PharmacyOrder.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPharmacyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    if (!pharmacy) return res.status(403).json({ message: 'Pharmacy profile not found' });
    const { status } = req.query;
    const filter = { pharmacy: pharmacy._id };
    if (status) filter.status = status;
    const orders = await PharmacyOrder.find(filter)
      .populate("user", "name email phoneNumber")
      .populate("medicalRecord")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get Pharmacy Orders Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const order = await PharmacyOrder.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const pharmacy = await Pharmacy.findOne({ user: userId });
    const allowed = order.user.toString() === userId.toString() || (pharmacy && pharmacy._id.toString() === order.pharmacy.toString());
    if (!allowed) return res.status(403).json({ message: 'Not authorized' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const pharmacy = await Pharmacy.findOne({ user: userId });
    const order = await PharmacyOrder.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!pharmacy || pharmacy._id.toString() !== order.pharmacy.toString()) {
      return res.status(403).json({ message: 'Not authorized to update order' });
    }
    order.status = status || order.status;
    await order.save();

    // Notify referring doctor if clinical order
    if (status === "completed" && order.medicalRecord) {
      try {
        const MedicalRecord = require("../models/medicalRecord");
        const Notification = require("../models/notification");
        const record = await MedicalRecord.findById(order.medicalRecord);
        if (record && record.doctor) {
          await Notification.create({
            recipient: record.doctor,
            sender: order.pharmacy,
            type: "progress",
            title: "Prescription Dispensed",
            message: `Medication for your patient has been dispensed by the pharmacy.`,
            relatedId: record._id,
            onModel: "MedicalRecord"
          });
          console.log("✅ Referring doctor notified of prescription fulfillment");
        }
      } catch (err) {
        console.error("Error notifying doctor of pharmacy order completion:", err);
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const order = await PharmacyOrder.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the customer can cancel this order' });
    }
    order.status = 'cancelled';
    order.cancellationReason = reason || null;
    order.cancelledAt = new Date();
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
