const express = require('express');
const router = express.Router();
const { getOverviewStats, getAllUsers } = require('../controllers/adminController');

// GET /api/admin/overview - aggregated dashboard stats
router.get('/overview', getOverviewStats);

// GET /api/admin/users - all registered users
router.get('/users', getAllUsers);

module.exports = router;
