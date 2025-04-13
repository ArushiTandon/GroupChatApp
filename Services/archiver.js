const cron = require('node-cron');
const { Op } = require('sequelize');
const sequelize = require('../util/db');

const Private = require('../Models/privateModel');
const ArchivedPrivate = require('../Models/archivedPrivate');

const GroupMessage = require('../Models/groupMessage');
const ArchivedGroupMessage = require('../Models/archivedGroupMessage');

// CRON — Every night at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log("🔁 Running daily archiver job...");

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const t = await sequelize.transaction();

  try {
    // -------------------- PRIVATE MESSAGES --------------------
    const oldPrivateMsgs = await Private.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction: t,
    });

    if (oldPrivateMsgs.length > 0) {
      const archivedPrivate = oldPrivateMsgs.map(msg => ({
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: msg.message,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      await ArchivedPrivate.bulkCreate(archivedPrivate, { transaction: t });
      await Private.destroy({
        where: { id: oldPrivateMsgs.map(msg => msg.id) },
        transaction: t,
      });

      console.log(`✅ Archived ${oldPrivateMsgs.length} private messages`);
    }

    // -------------------- GROUP MESSAGES --------------------
    const oldGroupMsgs = await GroupMessage.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction: t,
    });

    if (oldGroupMsgs.length > 0) {
      const archivedGroup = oldGroupMsgs.map(msg => ({
        message: msg.message,
        group_id: msg.group_id,
        user_id: msg.user_id,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      await ArchivedGroupMessage.bulkCreate(archivedGroup, { transaction: t });
      await GroupMessage.destroy({
        where: { id: oldGroupMsgs.map(msg => msg.id) },
        transaction: t,
      });

      console.log(`✅ Archived ${oldGroupMsgs.length} group messages`);
    }

    await t.commit();
  } catch (err) {
    await t.rollback();
    console.error("❌ Archiving job failed:", err);
  }
});
