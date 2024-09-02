const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

const addColumn = async () => {

  await queryInterface.addColumn("services", "service_name", {
    type: DataTypes.STRING,
    allowNull: true, 
    defaultValue:'null'
  });
};

addColumn();
