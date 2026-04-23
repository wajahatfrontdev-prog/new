const LabBooking = require('../models/labBooking');
const Course = require('../models/course');

// @desc    Get health program recommendations based on lab results
// @route   GET /api/laboratories/recommendations/:patientId
// @access  Private
exports.getHealthRecommendations = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient's recent lab results
    const bookings = await LabBooking.find({
      patient: patientId,
      status: 'completed',
      results: { $exists: true, $ne: [] }
    })
    .select('results testName testDate')
    .sort({ testDate: -1 })
    .limit(20);

    if (bookings.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        message: 'No lab results found for recommendations'
      });
    }

    // Analyze results and generate recommendations
    const recommendations = analyzeLabResults(bookings);

    // Find matching courses/programs
    const recommendedPrograms = await findMatchingPrograms(recommendations);

    res.status(200).json({
      success: true,
      count: recommendedPrograms.length,
      recommendations: recommendedPrograms
    });
  } catch (error) {
    console.error('Error getting health recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auto-recommend programs when results uploaded
// @route   POST /api/laboratories/recommendations/auto-recommend
// @access  Private (Lab/System)
exports.autoRecommendPrograms = async (req, res) => {
  try {
    const { bookingId, patientId, results } = req.body;

    // Analyze new results
    const recommendations = analyzeSingleBooking(results);

    if (recommendations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No recommendations needed',
        recommendations: []
      });
    }

    // Find matching programs
    const programs = await findMatchingPrograms(recommendations);

    // TODO: Send notification to patient with recommendations
    console.log(`📋 Auto-recommended ${programs.length} programs for patient ${patientId}`);

    res.status(200).json({
      success: true,
      recommendations: programs,
      bookingId
    });
  } catch (error) {
    console.error('Error auto-recommending programs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper: Analyze lab results and identify health concerns
function analyzeLabResults(bookings) {
  const concerns = [];

  bookings.forEach(booking => {
    booking.results.forEach(result => {
      const value = parseFloat(result.value);
      const param = result.testParameter.toLowerCase();

      // Diabetes indicators
      if (param.includes('glucose') || param.includes('hba1c')) {
        if (param.includes('hba1c') && value > 6.5) {
          concerns.push({
            condition: 'diabetes',
            severity: value > 9 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        } else if (value > 126) {
          concerns.push({
            condition: 'diabetes',
            severity: value > 200 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Cholesterol/Cardiac indicators
      if (param.includes('cholesterol')) {
        if (value > 240) {
          concerns.push({
            condition: 'heart-health',
            severity: value > 300 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Blood pressure (if recorded)
      if (param.includes('blood pressure') || param.includes('bp')) {
        const systolic = parseFloat(value.toString().split('/')[0]);
        if (systolic > 140) {
          concerns.push({
            condition: 'hypertension',
            severity: systolic > 180 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value
          });
        }
      }

      // Anemia indicators
      if (param.includes('hemoglobin') || param.includes('hgb')) {
        if (value < 12) {
          concerns.push({
            condition: 'anemia',
            severity: value < 8 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Thyroid indicators
      if (param.includes('tsh')) {
        if (value > 5.0 || value < 0.4) {
          concerns.push({
            condition: 'thyroid',
            severity: 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Vitamin D deficiency
      if (param.includes('vitamin d')) {
        if (value < 20) {
          concerns.push({
            condition: 'vitamin-deficiency',
            severity: value < 10 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Kidney function
      if (param.includes('creatinine')) {
        if (value > 1.2) {
          concerns.push({
            condition: 'kidney-health',
            severity: value > 2.0 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Liver function
      if (param.includes('alt') || param.includes('ast')) {
        if (value > 40) {
          concerns.push({
            condition: 'liver-health',
            severity: value > 100 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value,
            referenceRange: result.referenceRange
          });
        }
      }

      // Weight/BMI related
      if (param.includes('bmi')) {
        if (value > 30) {
          concerns.push({
            condition: 'weight-management',
            severity: value > 35 ? 'high' : 'medium',
            parameter: result.testParameter,
            value: result.value
          });
        }
      }
    });
  });

  return concerns;
}

// Helper: Analyze single booking
function analyzeSingleBooking(results) {
  const mockBooking = [{ results }];
  return analyzeLabResults(mockBooking);
}

// Helper: Find matching courses/programs
async function findMatchingPrograms(concerns) {
  if (!concerns || concerns.length === 0) return [];

  // Map conditions to course categories/tags
  const conditionToCategory = {
    'diabetes': ['diabetes', 'endocrinology', 'chronic-care'],
    'heart-health': ['cardiology', 'heart', 'cardiovascular'],
    'hypertension': ['cardiology', 'heart', 'chronic-care'],
    'anemia': ['hematology', 'nutrition', 'general-health'],
    'thyroid': ['endocrinology', 'thyroid', 'hormonal'],
    'vitamin-deficiency': ['nutrition', 'wellness', 'supplements'],
    'kidney-health': ['nephrology', 'kidney', 'chronic-care'],
    'liver-health': ['hepatology', 'liver', 'detox'],
    'weight-management': ['nutrition', 'fitness', 'wellness', 'weight-loss']
  };

  const recommendedPrograms = [];
  const processedConditions = new Set();

  for (const concern of concerns) {
    if (processedConditions.has(concern.condition)) continue;
    processedConditions.add(concern.condition);

    const categories = conditionToCategory[concern.condition] || [];

    // Find courses matching these categories
    const courses = await Course.find({
      $or: [
        { category: { $in: categories } },
        { tags: { $in: categories } },
        { title: { $regex: concern.condition, $options: 'i' } }
      ],
      isActive: true,
      isPublished: true
    })
    .select('title description category instructor duration price rating thumbnailUrl')
    .populate('instructor', 'name')
    .limit(3);

    courses.forEach(course => {
      recommendedPrograms.push({
        course,
        reason: `Recommended based on your ${concern.parameter} result (${concern.value})`,
        condition: concern.condition,
        severity: concern.severity,
        priority: concern.severity === 'high' ? 1 : 2
      });
    });
  }

  // Sort by priority and remove duplicates
  const unique = recommendedPrograms.filter((v, i, a) => 
    a.findIndex(t => t.course._id.toString() === v.course._id.toString()) === i
  );

  return unique.sort((a, b) => a.priority - b.priority).slice(0, 10);
}

// @desc    Get patient's health score
// @route   GET /api/laboratories/health-score/:patientId
// @access  Private
exports.getHealthScore = async (req, res) => {
  try {
    const { patientId } = req.params;

    const bookings = await LabBooking.find({
      patient: patientId,
      status: 'completed',
      results: { $exists: true, $ne: [] }
    }).select('results testDate criticalAlert');

    if (bookings.length === 0) {
      return res.status(200).json({
        success: true,
        healthScore: 0,
        grade: 'N/A',
        message: 'No lab data available'
      });
    }

    // Calculate health score (0-100)
    let totalTests = 0;
    let normalResults = 0;
    let abnormalResults = 0;
    let criticalResults = 0;

    bookings.forEach(booking => {
      booking.results.forEach(result => {
        totalTests++;
        if (result.severity === 'normal') {
          normalResults++;
        } else if (result.severity === 'critical') {
          criticalResults++;
        } else {
          abnormalResults++;
        }
      });
    });

    // Score calculation
    const normalPercentage = totalTests > 0 ? (normalResults / totalTests) * 100 : 0;
    const criticalPenalty = criticalResults * 5;
    const abnormalPenalty = abnormalResults * 2;
    
    let healthScore = Math.max(0, Math.min(100, normalPercentage - criticalPenalty - abnormalPenalty));
    healthScore = Math.round(healthScore);

    // Determine grade
    let grade = 'F';
    if (healthScore >= 90) grade = 'A+';
    else if (healthScore >= 85) grade = 'A';
    else if (healthScore >= 80) grade = 'B+';
    else if (healthScore >= 75) grade = 'B';
    else if (healthScore >= 70) grade = 'C+';
    else if (healthScore >= 60) grade = 'C';
    else if (healthScore >= 50) grade = 'D';

    res.status(200).json({
      success: true,
      healthScore,
      grade,
      breakdown: {
        totalTests,
        normalResults,
        abnormalResults,
        criticalResults,
        normalPercentage: parseFloat(normalPercentage.toFixed(2))
      },
      lastUpdated: bookings[bookings.length - 1]?.testDate
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
