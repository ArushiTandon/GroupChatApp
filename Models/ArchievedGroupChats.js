const { DataTypes } = require("sequelize");
const sequelize = require("../util/db");

const ArchivedGroup = sequelize.define(
  "ArchivedGroup",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Groups",
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "ArchivedGroupChats",
  }
);

module.exports = ArchivedGroup;
