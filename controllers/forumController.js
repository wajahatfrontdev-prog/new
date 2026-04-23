const ForumPost = require('../models/forumPost');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, isAnonymized, tags } = req.body;
    const post = await ForumPost.create({
      title,
      content,
      category,
      isAnonymized,
      tags,
      author: req.user._id
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Create Forum Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category, tag } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const posts = await ForumPost.find(filter)
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Handle anonymization
    const processedPosts = posts.map(post => {
      const p = post.toObject();
      if (p.isAnonymized) {
        p.author = { name: 'Anonymous Specialist', profilePicture: null };
      }
      return p;
    });

    res.status(200).json({ success: true, posts: processedPosts });
  } catch (error) {
    console.error("Get Forum Posts Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, isAnonymized } = req.body;
    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      text,
      isAnonymized,
      author: req.user._id
    });
    await post.save();

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();

    res.status(200).json({ success: true, likesCount: post.likes.length });
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
