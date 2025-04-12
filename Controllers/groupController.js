const Groups = require('../Models/groupsModel');
const UserGroups = require('../Models/userGroups');
const GroupMessage = require('../Models/groupMessage');
const User = require('../Models/userModel');
const sequelize = require('../util/db');
const { Op } = require('sequelize');

exports.createGroup = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { group_name, members } = req.body;
    const creatorId = req.user.id;

    const group = await Groups.create(
      { group_name: group_name, created_by: creatorId },
      { transaction: t }
    );

    const allMembers = [creatorId, ...members];

    const groupMembers = allMembers.map((userId) => ({
      group_id: group.id,
      user_id: userId,
      is_admin: userId === creatorId,

    }));

    await UserGroups.bulkCreate(groupMembers, { transaction: t });

    await t.commit();
    return res.status(201).json({ message: "Group created!", groupId: group.id });

  } catch (err) {
    await t.rollback();
    console.error("Error creating group:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};


exports.getGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Groups,
        attributes: ['id', 'group_name'],
        through: { attributes: ['is_admin'] }
      }
    });

    const formattedGroups = user.Groups.map(group => ({
      id: group.id,
      group_name: group.group_name,
      is_admin: group.UserGroups.is_admin === true
    }));

    res.status(200).json({ groups: formattedGroups });

  } catch (error) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};


// const isGroupAdmin = async (groupId, userId) => {
//   const member = await UserGroups.findOne({
//     where: { group_id: groupId, user_id: userId }
//   });
//   return member?.is_admin === true;
// };

exports.saveGroupMessage = async (groupId, senderId, message) => {

  try {

    const newMsg = await GroupMessage.create({
      group_id: groupId,
      user_id: senderId,
      message: message,
    });

    return newMsg;
    
  } catch (error) {
    console.error("Error saving group message:", error);
    return res.status(500).json({ error: "Something went wrong." });
    
  }
}

exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    
    const isMember = await UserGroups.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });

    if (!isMember) {
      return res.status(403).json({ error: "You are not part of this group" });
    }

    
    const messages = await GroupMessage.findAll({
      where: { group_id: groupId },
      include: {
        model: User,
        attributes: ['username'],
      },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({ messages });

  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getGroupMembers = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const members = await UserGroups.findAll({
      where: { group_id: groupId },
      include: {
        model: User,
        attributes: ["id", "username", "email", "phone"]
      }
    });

    const formatted = members.map(member => ({
      userId: member.User.id,
      username: member.User.username,
      email: member.User.email,
      phone: member.User.phone,
      is_admin: member.is_admin
    }));

    res.status(200).json({ members: formatted });

  } catch (err) {
    console.error("Error fetching group members:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.getNonGroupMembers = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const groupMembers = await UserGroups.findAll({
      where: { group_id: groupId },
      attributes: ['user_id']
    });

    const memberIds = groupMembers.map(m => m.user_id);

    const users = await User.findAll({
      where: {
        id: { [ Op.notIn]: memberIds }
      },
      attributes: ['id', 'username']
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching non-members:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// invite users to group
exports.inviteUsersToGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const userIds = req.body.userIds;

  try {
    const newInvites = userIds.map(id => ({
      user_id: id,
      group_id: groupId,
      is_admin: false
    }));

    await UserGroups.bulkCreate(newInvites);
    res.status(200).json({ message: "Users added to group" });
  } catch (err) {
    console.error("Error inviting users:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.makeAdmin = async (req, res) => {
  const { groupId, userId } = req.params;
  const requesterId = req.user.id;

  const isRequesterAdmin = await UserGroups.findOne({
    where: { 
      group_id: groupId, 
      user_id: requesterId, 
      is_admin: true }
  });

  if (!isRequesterAdmin) {
    return res.status(403).json({ error: "Only admins can promote members." });
  }

  await UserGroups.update(
    { is_admin: true },
    { where: { group_id: groupId, user_id: userId } }
  );

  return res.status(200).json({ message: "User promoted to admin." });
};


exports.removeMember = async (req, res) => {
  const { groupId, userId } = req.params;
  const requesterId = req.user.id;

  const isRequesterAdmin = await UserGroups.findOne({
    where: { 
      group_id: groupId, 
      user_id: requesterId, 
      is_admin: true 
    }
  });

  if (!isRequesterAdmin) {
    return res.status(403).json({ error: "Only admins can remove members." });
  }

  await UserGroups.destroy({
    where: { 
      group_id: groupId, 
      user_id: userId 
    }
  });

  return res.status(200).json({ message: "User removed from group." });
};
