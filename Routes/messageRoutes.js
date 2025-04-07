const express = require('express');
const { postMessage } = require('../Controllers/messageController')
const router = express.Router();
const passport = require('../Middlewares/auth');
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();

const localAuthMid = passport.authenticate('local', {session: false});

//post message
router.post('/send', jwtAuthMiddleware, postMessage);


module.exports = router;