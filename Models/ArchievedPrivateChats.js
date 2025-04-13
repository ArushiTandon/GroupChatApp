// models/archivedPrivate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const ArchivedPrivate = sequelize.define('ArchivedPrivate', {
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'ArchivedChats',
});

module.exports = ArchivedPrivate;
