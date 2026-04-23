const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['General', 'Case Study', 'Clinical Research', 'Platform Help'], default: 'General' },
  isAnonymized: { type: Boolean, default: false },
  tags: [String],
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnonymized: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
