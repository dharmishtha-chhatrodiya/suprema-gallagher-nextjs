const { DataTypes, STRING } = require("sequelize");
const sequelize = require("../utils/database.utils");

const loginUserRecord = sequelize.define(
  "loginUserRecord",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    login_id: {
      type: STRING,
      allowNull: false
    },
    password: {
      type: STRING,
      allowNull: false
    },
    bs_session_id: {
      type: STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

module.exports = loginUserRecord;
