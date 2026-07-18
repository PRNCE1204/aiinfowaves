const express = require('express');
const router = express.Router();
const { submitContactMessage, getAllContactMessages } = require('../controllers/contactController');


// POST /api/contact/submit
router.post('/submit', submitContactMessage);

// GET /api/contact - Admin: all contact messages
router.get('/', getAllContactMessages);


module.exports = router;
