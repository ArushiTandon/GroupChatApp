const express = require('express');
const groupController = require('../Controllers/groupController');
const router = express.Router();
const passport = require('../Middlewares/auth');
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();


//create group
router.post("/create", jwtAuthMiddleware, groupController.createGroup);

//get groups
router.get("/getGroups", jwtAuthMiddleware, groupController.getGroups);

module.exports = router;