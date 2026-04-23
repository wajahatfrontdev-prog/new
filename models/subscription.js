const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Basic', 'Premium', 'Family', 'Chronic Care', 'Preventive'], required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in months
  features: [{
    name: String,
    description: String,
    included: { type: Boolean, default: true }
  }],
  benefits: {
    discountedConsultations: { type: Number, default: 0 }, // percentage
    freeLabTests: { type: Number, default: 0 }, // count per month
    priorityBooking: { type: Boolean, default: false },
    freeHealthPrograms: { type: Number, default: 0 },
    familyMembers: { type: Number, default: 1 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const userSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  autoRenew: { type: Boolean, default: true },
  paymentMethod: String,
  transactionId: String,
  usageStats: {
    consultationsUsed: { type: Number, default: 0 },
    labTestsUsed: { type: Number, default: 0 },
    programsAccessed: { type: Number, default: 0 }
  },
  cancelledAt: Date,
  cancellationReason: String
}, { timestamps: true });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = { SubscriptionPlan, UserSubscription };
