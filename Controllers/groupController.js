const Groups = require('../Models/groupsModel');
const UserGroups = require('../Models/userGroups');
const GroupMessage = require('../Models/groupMessage');
const User = require('../Models/userModel');
const sequelize = require('../util/db');

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

    const groups = await User.findByPk(userId , {
      include: {
        model: Groups,
        attributes: ['id', 'group_name'],
        through: { attributes: [] }
      }
    })

    // console.log(groups);

    res.status(200).json({ groups: groups.Groups })


    
  } catch (error) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({ error: "Something went wrong." });
    
  }
}

//admin check
// const isAdmin = await UserGroups.findOne({
//   where: {
//     group_id: groupId,
//     user_id: req.user.id,
//     is_admin: true
//   }
// });

// if (!isAdmin) {
//   return res.status(403).json({ error: "You are not admin of this group" });
// }
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

    console.log("Fetched messages:", messages);
    res.status(200).json({ messages });

  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

