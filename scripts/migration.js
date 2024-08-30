const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

const addColumn = async () => {

  await queryInterface.addColumn("jobs", "salary", {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true, 
  });
};

addColumn();
