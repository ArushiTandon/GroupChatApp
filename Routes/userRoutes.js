const express = require('express');
const { signUp } = require('../Controllers/userController')
const router = express.Router();
// const passport = require('../middlewares/auth');
// const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();

// const localAuthMid = passport.authenticate('local', {session: false});

// Create a new user
router.post('/signup', signUp);

// // Login
// router.post('/login', localAuthMid, login);

// // UserInfo
// router.get('/userinfo', jwtAuthMiddleware, getUserInfo);

// // Get user files
// router.get('/files' , jwtAuthMiddleware, getUserFiles);

module.exports = router;