const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

const addColumn = async () => {
  await queryInterface.addConstraint('servicesection', {
    fields: ['service_id'],
    type: 'foreign key',
    name: 'servicesection_service_id_fkey',
    references: {
      table: 'services',
      field: 'id',
    },
    onDelete: 'CASCADE', // or 'SET NULL' if you prefer
    onUpdate: 'CASCADE',
  });
  await queryInterface.addColumn("services", "service_name", {
    type: DataTypes.STRING,
    allowNull: true, 
    defaultValue:'null'
  });
};



const down=async()=>{
  await queryInterface.removeConstraint('servicesection', 'servicesection_service_id_fkey');
  await queryInterface.removeColumn('services','service_name');
}

down();
addColumn();
