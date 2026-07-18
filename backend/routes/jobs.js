const express = require('express');
const router = express.Router();
const { uploadJobResume } = require('../config/cloudinary');
const {
  applyJob,
  getAllJobApplications,
  updateJobApplicationStatus,
  getJobStats
} = require('../controllers/jobController');

// Helper to surface multer errors as clean JSON
const multerErrorHandler = (req, res, next) => {
  uploadJobResume.single('resume')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Public Route — submit a job application
router.post('/apply', multerErrorHandler, applyJob);

const { requireAdmin } = require('../middleware/adminMiddleware');

// Admin Routes
router.get('/', requireAdmin, getAllJobApplications);
router.get('/stats', requireAdmin, getJobStats);
router.put('/:id/status', requireAdmin, updateJobApplicationStatus);

module.exports = router;
