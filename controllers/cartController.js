const Cart = require('../models/cart');
const Medicine = require('../models/medicine');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.medicine');
    res.status(200).json({ success: true, cart: cart || { user: userId, items: [] } });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.addItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicineId, quantity } = req.body;
    const med = await Medicine.findById(medicineId);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [{ medicine: medicineId, quantity: quantity || 1 }] });
    } else {
      const idx = cart.items.findIndex(i => i.medicine.toString() === medicineId);
      if (idx >= 0) {
        cart.items[idx].quantity += quantity || 1;
      } else {
        cart.items.push({ medicine: medicineId, quantity: quantity || 1 });
      }
      await cart.save();
    }
    const full = await Cart.findById(cart._id).populate('items.medicine');
    res.status(200).json({ success: true, cart: full });
  } catch (error) {
    console.error('Add Item Cart Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicineId, quantity } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const idx = cart.items.findIndex(i => i.medicine.toString() === medicineId);
    if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });
    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();
    const full = await Cart.findById(cart._id).populate('items.medicine');
    res.status(200).json({ success: true, cart: full });
  } catch (error) {
    console.error('Update Item Cart Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { new: true, upsert: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
