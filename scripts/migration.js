const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

const addColumn = async () => {
  await queryInterface.addColumn("jobs", "deleted", {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: "false",
  });
  await queryInterface.addColumn("jobs", "deleted_date", {
    type: DataTypes.DATEONLY,
    allowNull: true,
  });
  await queryInterface.addColumn("jobs", "deleted_by", {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "null",
  });
  await queryInterface.addColumn("jobs", "active", {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: "true",
  });
  await queryInterface.addColumn("jobs", "company_name", {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "null",
  });
};

addColumn();
