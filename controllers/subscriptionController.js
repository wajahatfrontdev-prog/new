const { SubscriptionPlan, UserSubscription } = require('../models/subscription');
const Notification = require('../models/notification');

// Get all available subscription plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Subscribe to a plan
exports.subscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod, transactionId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
      user: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "You already have an active subscription" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const subscription = await UserSubscription.create({
      user: userId,
      plan: planId,
      startDate,
      endDate,
      status: 'active',
      paymentMethod,
      transactionId
    });

    // Notify user
    await Notification.create({
      user: userId,
      title: "Subscription Activated",
      message: `Your ${plan.name} subscription is now active!`,
      type: "subscription"
    });

    const populatedSubscription = await UserSubscription.findById(subscription._id)
      .populate('plan');

    res.status(201).json({
      success: true,
      message: "Subscription activated successfully",
      subscription: populatedSubscription
    });
  } catch (error) {
    console.error("Subscribe Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get my subscription
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await UserSubscription.findOne({ user: userId })
      .populate('plan')
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(200).json({ success: true, subscription: null });
    }

    // Check if subscription expired
    if (subscription.status === 'active' && new Date() > subscription.endDate) {
      subscription.status = 'expired';
      await subscription.save();
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error("Get My Subscription Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const subscription = await UserSubscription.findOne({
      user: userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    subscription.autoRenew = false;
    await subscription.save();

    await Notification.create({
      user: userId,
      title: "Subscription Cancelled",
      message: "Your subscription has been cancelled. You can still use benefits until the end date.",
      type: "subscription"
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: Create subscription plan
exports.createPlan = async (req, res) => {
  try {
    const { name, type, price, duration, features, benefits } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      type,
      price,
      duration,
      features,
      benefits
    });

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      plan
    });
  } catch (error) {
    console.error("Create Plan Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check subscription benefits
exports.checkBenefits = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: userId,
      status: 'active'
    }).populate('plan');

    if (!subscription || new Date() > subscription.endDate) {
      return null;
    }

    return subscription.plan.benefits;
  } catch (error) {
    console.error("Check Benefits Error:", error);
    return null;
  }
};

module.exports.checkBenefits = exports.checkBenefits;
