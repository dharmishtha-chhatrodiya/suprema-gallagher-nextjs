const { DataTypes, INTEGER } = require("sequelize");
const sequelize = require("../utils/database.utils");

const GlobalUserRecord = sequelize.define(
  "globalUserRecord",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = GlobalUserRecord;
