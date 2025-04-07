const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');
const bcrypt = require('bcrypt');

const Users = sequelize.define(
    'Users',
    {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    },
    {
        timestamps: false,
    }
);

Users.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

Users.prototype.comparePassword = async function (userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

module.exports = Users;
