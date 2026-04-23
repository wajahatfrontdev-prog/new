const LabSupply = require('../models/labSupply');
const Laboratory = require('../models/laboratory');

// Get all supplies for a laboratory
exports.getSupplies = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get lab profile
    const lab = await Laboratory.findOne({ user: userId });
    if (!lab) {
      return res.status(404).json({ message: "Laboratory profile not found" });
    }

    const supplies = await LabSupply.find({ laboratory: lab._id }).sort({ itemName: 1 });
    
    res.status(200).json({
      success: true,
      supplies
    });
  } catch (error) {
    console.error("Get Supplies Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const lab = await Laboratory.findOne({ user: userId });
    if (!lab) {
      return res.status(404).json({ message: "Laboratory profile not found" });
    }

    const supplies = await LabSupply.find({ laboratory: lab._id });
    const lowStockItems = supplies.filter(item => item.currentStock <= item.minStockLevel);
    
    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      alerts: lowStockItems
    });
  } catch (error) {
    console.error("Get Low Stock Alerts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new supply item
exports.addSupply = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemName, category, currentStock, minStockLevel, unit, supplier, expiryDate, notes } = req.body;
    
    const lab = await Laboratory.findOne({ user: userId });
    if (!lab) {
      return res.status(404).json({ message: "Laboratory profile not found" });
    }

    const supply = await LabSupply.create({
      laboratory: lab._id,
      itemName,
      category,
      currentStock,
      minStockLevel,
      unit,
      supplier,
      expiryDate,
      notes,
      lastRestocked: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Supply item added successfully",
      supply
    });
  } catch (error) {
    console.error("Add Supply Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update supply stock
exports.updateStock = async (req, res) => {
  try {
    const { supplyId } = req.params;
    const { currentStock, action } = req.body; // action: 'set', 'add', 'subtract'
    
    const supply = await LabSupply.findById(supplyId);
    if (!supply) {
      return res.status(404).json({ message: "Supply item not found" });
    }

    if (action === 'set') {
      supply.currentStock = currentStock;
    } else if (action === 'add') {
      supply.currentStock += currentStock;
      supply.lastRestocked = new Date();
    } else if (action === 'subtract') {
      supply.currentStock = Math.max(0, supply.currentStock - currentStock);
    }

    await supply.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      supply
    });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete supply item
exports.deleteSupply = async (req, res) => {
  try {
    const { supplyId } = req.params;
    
    await LabSupply.findByIdAndDelete(supplyId);

    res.status(200).json({
      success: true,
      message: "Supply item deleted successfully"
    });
  } catch (error) {
    console.error("Delete Supply Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
