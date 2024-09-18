const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

// menu module migration

const menuAddColumn = async () => {
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



const Menudown=async()=>{
  await queryInterface.removeConstraint('menus', 'menus_parent_id_fkey');
  await queryInterface.removeColumn('menus','parent_id');
}



const jobaddColumn = async () => {
  await queryInterface.addConstraint('jobs', {
    fields: ['deleted_by'],
    type: 'foreign key',
    name: 'jobs_deleted_by_fkey',
    references: {
      table: 'jobs',
      field: 'id',
    },
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE',
  });
  // await queryInterface.addColumn('jobs','link',{
  //   type:DataTypes.STRING,
  //   allowNull:true,
  //   defaultValue:'/'
  // })
  await queryInterface.addColumn("jobs", "deleted_by", {
    type: DataTypes.STRING,
    allowNull: true, 
    defaultValue:'null'
  });
};



const jobdown=async()=>{
  await queryInterface.removeConstraint('jobs', 'jobs_deleted_by_fkey');
  await queryInterface.removeColumn('jobs','deleted_by');
}


Menudown()
menuAddColumn();
jobdown();
jobaddColumn();



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

// addNewColumn()