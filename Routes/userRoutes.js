const express = require('express');
const { signUp, login, getUsers } = require('../Controllers/userController')
const router = express.Router();
const passport = require('../Middlewares/auth');
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();

const localAuthMid = passport.authenticate('local', {session: false});

// Create a new user
router.post('/signup', signUp);

// Login
router.post('/login', localAuthMid, login);

// get all users
router.get('/users', jwtAuthMiddleware, getUsers);

// // Get user files
// router.get('/files' , jwtAuthMiddleware, getUserFiles);

module.exports = router;