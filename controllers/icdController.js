const ICDCode = require('../models/icdCode');

// Search ICD-10 codes
exports.searchICDCodes = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        results: []
      });
    }

    // Search by code or description
    const results = await ICDCode.find({
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(20)
    .sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search ICD Codes Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get ICD codes by category
exports.getICDCodesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const codes = await ICDCode.find({ category }).sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: codes.length,
      codes
    });
  } catch (error) {
    console.error('Get ICD Codes By Category Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ICDCode.distinct('category');

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
