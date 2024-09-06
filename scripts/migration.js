const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

const addColumn = async () => {
  await queryInterface.addConstraint('menus', {
    fields: ['parent_id'],
    type: 'foreign key',
    name: 'menus_parent_id_fkey',
    references: {
      table: 'menus',
      field: 'id',
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE',
  });
  // await queryInterface.addColumn('menus','link',{
  //   type:DataTypes.STRING,
  //   allowNull:true,
  //   defaultValue:'/'
  // })
  await queryInterface.addColumn("menus", "parent_id", {
    type: DataTypes.STRING,
    allowNull: true, 
    defaultValue:'null'
  });
};



const down=async()=>{
  await queryInterface.removeConstraint('menus', 'menus_parent_id_fkey');
  await queryInterface.removeColumn('menus','parent_id');
}

down();
addColumn();
