const express = require('express');
const router = express.Router();

const { getOverviewStats, getAllUsers } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// ── Protected (requireAdmin) ──────────────────────────────────
// GET /api/admin/overview — aggregated dashboard stats
router.get('/overview', requireAdmin, getOverviewStats);

// GET /api/admin/users — all registered users
router.get('/users', requireAdmin, getAllUsers);

module.exports = router;
