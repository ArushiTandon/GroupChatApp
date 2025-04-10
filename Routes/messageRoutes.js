const express = require('express');
const { postMessage, getChatHistory } = require('../Controllers/messageController')
const router = express.Router();
const passport = require('../Middlewares/auth');
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();

//post message
router.post('/send', jwtAuthMiddleware, postMessage);

//message history
router.get('/history/:receiverId', jwtAuthMiddleware, getChatHistory);

module.exports = router;