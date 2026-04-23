const CommunityPost = require('../models/communityPost');

exports.getPosts = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = {};
        if (category && category !== 'All') filter.category = category;

        console.log('Fetching posts for category:', category || 'All');

        const posts = await CommunityPost.find(filter)
            .populate('author', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: posts.length, posts });
    } catch (error) {
        console.error('❌ Get Community Posts Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { content, category } = req.body;

        console.log('Creating post for user:', req.user.email);

        const post = await CommunityPost.create({
            author: userId,
            authorName: req.user.name,
            authorRole: req.user.role,
            isExpert: req.user.role === 'Doctor' || req.user.role === 'Instructor',
            content,
            category,
        });

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('❌ Create Community Post Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        console.log('Liking post:', id, 'by user:', req.user.email);

        const post = await CommunityPost.findById(id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (!post.likedBy) post.likedBy = [];
        if (!post.likes) post.likes = 0;

        const index = post.likedBy.indexOf(userId);
        if (index === -1) {
            post.likedBy.push(userId);
            post.likes += 1;
        } else {
            post.likedBy.splice(index, 1);
            post.likes -= 1;
        }

        await post.save();
        res.status(200).json({ success: true, likes: post.likes });
    } catch (error) {
        console.error('❌ Like Post Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        console.log('--- Add Comment Request ---');
        console.log('Post ID:', id);
        console.log('User ID:', req.user ? (req.user._id || req.user.id) : 'No User');
        console.log('Content:', content);

        if (!req.user) {
            console.log('Error: User not authenticated');
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const comment = {
            author: req.user._id || req.user.id,
            authorName: req.user.name || 'Anonymous',
            content: content,
            createdAt: new Date()
        };

        // Update the post using $push to avoid "undefined" property errors
        const post = await CommunityPost.findByIdAndUpdate(
            id,
            {
                $push: { comments: comment },
                $inc: { replies: 1 }
            },
            { new: true, runValidators: true }
        );

        if (!post) {
            console.log('Error: Post not found');
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        console.log('Success: Comment added via $push');
        res.status(201).json({ success: true, comment: comment, post: post });
    } catch (error) {
        console.error('❌ Add Comment Error Details:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
