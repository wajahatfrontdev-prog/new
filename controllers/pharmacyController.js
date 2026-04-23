const bcrypt = require("bcryptjs");
const Pharmacy = require("../models/pharmacy");


exports.AddPharmacyDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            cnic,
            ownerName,
            licenseNumber,
            licenseDocument,
            isAprroved,
            address,
            city,
            location,
            deliveryAvailable,
            openHours,
            availableMedicines
        } = req.body;

        const existingProfile = await Pharmacy.findOne({ user: userId }).populate('user', 'name email phoneNumber role createdAt')
        if (existingProfile) {
            existingProfile.cnic = cnic;
            existingProfile.ownerName = ownerName;
            existingProfile.licenseNumber = licenseNumber;
            existingProfile.licenseDocument = licenseDocument;
            existingProfile.isApproved = isAprroved;
            existingProfile.address = address;
            existingProfile.city = city;
            existingProfile.location = location;
            existingProfile.deliveryAvailable = deliveryAvailable;
            existingProfile.ownerName = ownerName;
            existingProfile.openHours = openHours;
            existingProfile.availableMedicines = availableMedicines
            await existingProfile.save()
            return res.status(200).json({
                message: 'Pharmacy Updated Successfully',
                existingProfile,
                success: true
            })
        }
        const pharmacy = await Pharmacy.create({
            user: userId,
            cnic,
            ownerName,
            licenseNumber,
            licenseDocument,
            address,
            city,
            location,
            deliveryAvailable,
            openHours,
            availableMedicines: availableMedicines ?? []
        })
        const fullpharmacy = await Pharmacy.findById(pharmacy._id).populate('user', 'name  email role phoneNunber createdAt')
        return res.status(201).json({
            message: "Pharmacy created successfully",
            paitent: fullpharmacy,
            success: true
        })
    } catch (error) {
        console.error("AddPharmacyDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


exports.getAllPharmacy = async (req, res) => {
    try {
        const pharmacies = await Pharmacy.find().populate("user", "name email role phoneNumber");
        res.status(200).json({ success: true, pharmacies });
    } catch (error) {
        console.error("Get All Pharmacies Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getPharmacyById = async (req, res) => {
    try {
        const { id } = req.params;
        const pharmacy = await Pharmacy.findById(id).populate('user', 'name email role phoneNumber createdAt');
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }
        res.status(200).json({ success: true, pharmacy });
    } catch (error) {
        console.error("Get Pharmacy By Id Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getPharmacyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const pharmacy = await Pharmacy.findOne({ user: userId }).populate('user', 'name email role phoneNumber createdAt');
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy profile not found' });
        }
        res.status(200).json({ success: true, pharmacy });
    } catch (error) {
        console.error("Get Pharmacy Profile Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTopSellingProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const pharmacy = await Pharmacy.findOne({ user: userId });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy profile not found' });
        }

        const PharmacyOrder = require('../models/pharmacyOrder');
        
        // Get all completed orders for this pharmacy
        const orders = await PharmacyOrder.find({
            pharmacy: pharmacy._id,
            status: 'completed'
        });

        // Count sales per product
        const productSales = {};
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productId = item.product?.toString() || item.productName;
                    if (productId) {
                        if (!productSales[productId]) {
                            productSales[productId] = {
                                productId,
                                productName: item.productName || 'Unknown',
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        productSales[productId].quantity += item.quantity || 0;
                        productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
                    }
                });
            }
        });

        // Convert to array and sort by quantity
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            topProducts
        });
    } catch (error) {
        console.error("Get Top Selling Products Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
