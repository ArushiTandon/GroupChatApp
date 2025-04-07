const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const Groups = sequelize.define(
    'Groups',
    {
        group_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },

    },
    {
        timestamps: true,
    }
);


module.exports = Groups;
