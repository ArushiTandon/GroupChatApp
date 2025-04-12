const express = require('express');
const { postMessage, getChatHistory, uploadMedia } = require('../Controllers/messageController')
const router = express.Router();
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();

//post message
router.post('/send', jwtAuthMiddleware, postMessage);

//message history
router.get('/history/:receiverId', jwtAuthMiddleware, getChatHistory);

//upload media
router.post('/upload', jwtAuthMiddleware, uploadMedia)


module.exports = router;