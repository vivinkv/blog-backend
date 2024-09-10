const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

// menu module migration

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

// down();
// addColumn();



// new migration

// const addNewColumn=async()=>{
//   await queryInterface.addColumn('user','user_id',{
//     type:DataTypes.STRING,
//     allowNull:true,
//     defaultValue:'null'
//   })

//   await queryInterface.addColumn('bannerimg','blog_id',{
//     type:DataTypes.STRING,
//     allowNull:true,
//     defaultValue:'null'
//   })

//   await queryInterface.addColumn('bannerimg','image_type',{
//     type:DataTypes.ENUM('banner','thumbanil','featured','attachment','og'),
//     allowNull:true,
//     defaultValue:'banner'
//   })

// }

// addNewColumn();


//add new column in user model

const addNewColumn=async()=>{
  await queryInterface.addColumn('user','password_expired',{
    type:DataTypes.BOOLEAN,
    defaultValue:'true'
  })
  await queryInterface.addColumn('comments','status',{
    type:DataTypes.INTEGER,
    defaultValue:1
  })
}

addNewColumn()