const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');
const bcrypt = require('bcrypt')

const UserFile = sequelize.define("UserFile", {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
      }
});
  


module.exports = UserFile;
  