const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const UserGroups = sequelize.define(
    'UserGroups',
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Groups',
                key: 'id'
            }
        },

        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    },
    {
        timestamps: true,
    }
);


module.exports = UserGroups;
