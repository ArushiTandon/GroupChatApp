const { DataTypes } = require('sequelize');
const sequelize = require('../Util/db');
const bcrypt = require('bcrypt');

const User = sequelize.define(
    'User',
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
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        isPremium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: false,
    }
);

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.comparePassword = async function (userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

module.exports = User;
