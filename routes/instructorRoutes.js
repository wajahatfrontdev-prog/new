const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { AddInstructorDetails, getAllInstructors, getInstructorById, getMyInstructorProfile, getStats, getAssignedLearners } = require('../controllers/instructorController');

const router = express.Router();

// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: function (req, file, cb) {
    const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  },
});

// Configure Multer for thumbnail image uploads
const thumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/thumbnails/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\//.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

router.post('/add_instructor_details', protect, AddInstructorDetails);
router.get('/get_all_instructors', getAllInstructors);
router.get('/stats', protect, getStats);
router.get('/me', protect, getMyInstructorProfile);
router.get('/assigned-learners', protect, getAssignedLearners);

// Video upload endpoint
router.post('/videos/upload', protect, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file uploaded' });
  }

  const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;

  res.status(200).json({
    success: true,
    videoUrl: videoUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
  });
});

// Thumbnail image upload endpoint
router.post('/thumbnails/upload', protect, uploadThumbnail.single('thumbnail'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/${req.file.filename}`;

  res.status(200).json({
    success: true,
    thumbnailUrl: thumbnailUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
  });
});

router.get('/:id', getInstructorById);

module.exports = router;
