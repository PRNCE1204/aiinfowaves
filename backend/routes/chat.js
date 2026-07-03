const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

// POST /api/chat
router.post('/', handleChatMessage);

module.exports = router;
