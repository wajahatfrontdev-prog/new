const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: String,
    authorRole: String,
    isExpert: { type: Boolean, default: false },
    category: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
