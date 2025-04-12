const Private = require('../Models/privateModel');
const UserFile = require('../Models/userFile');
const sequelize = require('../util/db');
const { uploadToS3 } = require('../Services/aws');
const { Op } = require('sequelize');


exports.postMessage = async (req, res) => {

    const t = await sequelize.transaction();
    try {
        const result = await sequelize.transaction(async (t) => {

            const { receiver_id, message } = req.body;
            const sender_id = req.user.id; 
            const newMessage = await Private.create({
                sender_id,
                receiver_id,
                message,
            }, { transaction: t });

            return newMessage;
        })

        await t.commit();
        res.status(201).json(result, {message: "Message sent successfully"});
    } catch (error) {
        await t.rollback();
        console.error('ERROR SENDING MESSAGE:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
      const receiverId = req.params.receiverId;
      const senderId = req.user.id;
  
      const limit = parseInt(req.query.limit) || 20; 
      const offset = parseInt(req.query.offset) || 0;
  
      const messages = await Private.findAll({
        where: {
          [Op.or]: [
            { sender_id: senderId, receiver_id: receiverId },
            { sender_id: receiverId, receiver_id: senderId },
          ],
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
  
      res.json({ messages: messages.reverse() }); 
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      res.status(500).json({ error: "Failed to load chat history" });
    }
  };

  exports.uploadMedia = uploadToS3;