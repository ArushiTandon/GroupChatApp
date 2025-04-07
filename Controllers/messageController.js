const bcrypt = require('bcrypt');
const User = require('../Models/userModel');
const Private = require('../Models/privateModel');
const sequelize = require('../util/db');


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