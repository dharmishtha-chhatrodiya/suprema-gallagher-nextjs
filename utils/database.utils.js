const Sequelize = require("sequelize");

const databaseUri = process.env.DATABASE_URI || "postgres://postgres:Creole@123@localhost:5432/suprema";

const sequelize = new Sequelize(databaseUri, {
  dialect: "postgres"
  // pool: {
  //     max: 3,
  //     min: 0,
  //     acquire: 3000,
  //     idle: 1000
  // },
});

module.exports = sequelize;
