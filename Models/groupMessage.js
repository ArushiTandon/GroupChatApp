const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const GroupMessage = sequelize.define(
    'GroupMessage',
    {
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Groups',
                key: 'id'
            }
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        mediaUrl: {
            type: DataTypes.STRING,
            allowNull: true,
          },

    },
    {
        timestamps: true,
    }
);


module.exports = GroupMessage;
