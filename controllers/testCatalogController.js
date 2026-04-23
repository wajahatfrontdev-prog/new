const TestCatalog = require('../models/testCatalog');

// @desc    Get all tests from catalog
// @route   GET /api/test-catalog
// @access  Public
exports.getAllTests = async (req, res) => {
  try {
    const tests = await TestCatalog.find({ isActive: true }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single test by ID
// @route   GET /api/test-catalog/:id
// @access  Public
exports.getTestById = async (req, res) => {
  try {
    const test = await TestCatalog.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({
      success: true,
      test
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get tests by category
// @route   GET /api/test-catalog/category/:category
// @access  Public
exports.getTestsByCategory = async (req, res) => {
  try {
    const tests = await TestCatalog.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    console.error('Error fetching tests by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search tests by name
// @route   GET /api/test-catalog/search?q=query
// @access  Public
exports.searchTests = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const tests = await TestCatalog.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    console.error('Error searching tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new test (Admin only)
// @route   POST /api/test-catalog
// @access  Private/Admin
exports.createTest = async (req, res) => {
  try {
    const {
      name,
      category,
      standardPrice,
      preparationInstructions,
      estimatedTime,
      requiredEquipment,
      normalRanges
    } = req.body;

    // Check if test already exists
    const existingTest = await TestCatalog.findOne({ name });
    if (existingTest) {
      return res.status(400).json({ message: 'Test with this name already exists' });
    }

    const test = await TestCatalog.create({
      name,
      category,
      standardPrice,
      preparationInstructions,
      estimatedTime,
      requiredEquipment,
      normalRanges
    });

    res.status(201).json({
      success: true,
      test
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update test (Admin only)
// @route   PUT /api/test-catalog/:id
// @access  Private/Admin
exports.updateTest = async (req, res) => {
  try {
    let test = await TestCatalog.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test = await TestCatalog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      test
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete test (Admin only)
// @route   DELETE /api/test-catalog/:id
// @access  Private/Admin
exports.deleteTest = async (req, res) => {
  try {
    const test = await TestCatalog.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Soft delete - set isActive to false
    test.isActive = false;
    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/test-catalog/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await TestCatalog.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get popular tests
// @route   GET /api/test-catalog/popular
// @access  Public
exports.getPopularTests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const tests = await TestCatalog.find({ isActive: true })
      .sort({ popularity: -1, createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: tests.length,
      tests
    });
  } catch (error) {
    console.error('Error fetching popular tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
