const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labName: String,
  ownerName: String,
  licenseNumber: String,
  isApproved: { type: Boolean, default: false },
  labEmail: String,
  labPhoneNumber: String,
  address: String,
  city: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  workingHours: {
    from: String,
    to: String
  },
  title: String,
  description: String,
  testsOffered: [String],
  availableTests: [{
    name: { type: String, required: true },
    price: { type: Number, default: 0 }
  }],
  homeSampleAvailable: { type: Boolean, default: false },
  ratings: [Number],
  reviews: [String]
}, { timestamps: true });

laboratorySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Laboratory', laboratorySchema);
