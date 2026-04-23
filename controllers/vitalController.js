const Vital = require('../models/vital');

exports.addVital = async (req, res) => {
    try {
        const { type, value, unit, status, note } = req.body;
        const newVital = new Vital({
            patient: req.user._id,
            type,
            value,
            unit,
            status,
            note
        });

        await newVital.save();
        res.status(201).json({
            success: true,
            message: 'Vital reading saved successfully',
            vital: newVital
        });
    } catch (error) {
        console.error('Add Vital Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save vital reading'
        });
    }
};

exports.getMyVitals = async (req, res) => {
    try {
        const vitals = await Vital.find({ patient: req.user._id }).sort({ createdAt: -1 });

        // Group by type for summaries
        const grouped = vitals.reduce((acc, v) => {
            if (!acc[v.type]) {
                acc[v.type] = [];
            }
            acc[v.type].push(v);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            vitals,
            grouped
        });
    } catch (error) {
        console.error('Get Vitals Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vitals'
        });
    }
};

exports.deleteVital = async (req, res) => {
    try {
        const result = await Vital.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Vital not found' });
        }
        res.status(200).json({ success: true, message: 'Vital deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete vital' });
    }
};
