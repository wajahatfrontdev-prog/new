const LifestyleTracking = require('../models/lifestyleTracking');

// Get today's lifestyle data
exports.getTodayData = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let data = await LifestyleTracking.findOne({
      user: userId,
      date: today
    });

    // Create entry if doesn't exist
    if (!data) {
      data = await LifestyleTracking.create({
        user: userId,
        date: today,
        waterIntake: 0,
        sleepHours: 0,
        steps: 0,
        exercise: 0
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get Today Data Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update lifestyle data
exports.updateData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { waterIntake, sleepHours, steps, exercise, notes } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await LifestyleTracking.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          ...(waterIntake !== undefined && { waterIntake }),
          ...(sleepHours !== undefined && { sleepHours }),
          ...(steps !== undefined && { steps }),
          ...(exercise !== undefined && { exercise }),
          ...(notes !== undefined && { notes })
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lifestyle data updated',
      data
    });
  } catch (error) {
    console.error('Update Data Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get lifestyle history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, days = 7 } = req.query;

    let query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last N days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      daysAgo.setHours(0, 0, 0, 0);
      query.date = { $gte: daysAgo };
    }

    const history = await LifestyleTracking.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get weekly summary
exports.getWeeklySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const history = await LifestyleTracking.find({
      user: userId,
      date: { $gte: weekAgo }
    }).sort({ date: -1 });

    // Calculate averages
    const summary = {
      avgWaterIntake: 0,
      avgSleepHours: 0,
      avgSteps: 0,
      avgExercise: 0,
      daysTracked: history.length
    };

    if (history.length > 0) {
      summary.avgWaterIntake = history.reduce((sum, d) => sum + d.waterIntake, 0) / history.length;
      summary.avgSleepHours = history.reduce((sum, d) => sum + d.sleepHours, 0) / history.length;
      summary.avgSteps = history.reduce((sum, d) => sum + d.steps, 0) / history.length;
      summary.avgExercise = history.reduce((sum, d) => sum + d.exercise, 0) / history.length;
    }

    res.status(200).json({
      success: true,
      summary,
      history
    });
  } catch (error) {
    console.error('Get Weekly Summary Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
