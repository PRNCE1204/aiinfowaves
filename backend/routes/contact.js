const express = require('express');
const router = express.Router();
const { submitContactMessage, getAllContactMessages } = require('../controllers/contactController');
const { requireAdmin } = require('../middleware/adminMiddleware');


// POST /api/contact/submit
router.post('/submit', submitContactMessage);

// GET /api/contact - Admin: all contact messages
router.get('/', requireAdmin, getAllContactMessages);


module.exports = router;
