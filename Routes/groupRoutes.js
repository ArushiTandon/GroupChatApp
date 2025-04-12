const express = require('express');
const groupController = require('../Controllers/groupController');
const router = express.Router();
const { jwtAuthMiddleware } = require('../middlewares/jwt');
require('dotenv').config();


//create group
router.post("/create", jwtAuthMiddleware, groupController.createGroup);

//get groups
router.get("/getGroups", jwtAuthMiddleware, groupController.getGroups);

//get group chat
router.get('/messages/:groupId', jwtAuthMiddleware, groupController.getGroupMessages);

//get group members
router.get("/members/:groupId", jwtAuthMiddleware, groupController.getGroupMembers);

// nonmembers of group
router.get('/nonmembers/:groupId', jwtAuthMiddleware, groupController.getNonGroupMembers);

// invite users to group
router.post('/invite/:groupId', jwtAuthMiddleware, groupController.inviteUsersToGroup);

// make group admin
router.patch('/make-admin/:groupId/:userId', jwtAuthMiddleware, groupController.makeAdmin);

// remove member
router.delete('/remove-member/:groupId/:userId', jwtAuthMiddleware, groupController.removeMember);

module.exports = router;