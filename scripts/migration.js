const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

// menu module migration

const addColumn = async () => {
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



const down=async()=>{
  await queryInterface.removeConstraint('jobs', 'jobs_deleted_by_fkey');
  await queryInterface.removeColumn('jobs','deleted_by');
}

down();
addColumn();



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