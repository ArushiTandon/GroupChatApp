const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const Private = sequelize.define(
    'Private',
    {
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        mediaUrl: {
            type: DataTypes.STRING,
            allowNull: true,
          },

        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

    },
    {
        timestamps: true,
    }
);


module.exports = Private;
