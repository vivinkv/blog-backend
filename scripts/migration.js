const { DataTypes,Sequelize } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

// menu module migration

const menuAddColumn = async () => {
  await queryInterface.addConstraint("menus", {
    fields: ["parent_id"],
    type: "foreign key",
    name: "menus_parent_id_fkey",
    references: {
      table: "menus",
      field: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  // await queryInterface.addColumn('menus','link',{
  //   type:DataTypes.STRING,
  //   allowNull:true,
  //   defaultValue:'/'
  // })
  await queryInterface.addColumn("menus", "parent_id", {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "null",
  });
};

const Menudown = async () => {
  await queryInterface.removeConstraint("menus", "menus_parent_id_fkey");
  await queryInterface.removeColumn("menus", "parent_id");
};

const jobaddColumn = async () => {
  await queryInterface.addConstraint("jobs", {
    fields: ["deleted_by"],
    type: "foreign key",
    name: "jobs_deleted_by_fkey",
    references: {
      table: "jobs",
      field: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  // await queryInterface.addColumn('jobs','link',{
  //   type:DataTypes.STRING,
  //   allowNull:true,
  //   defaultValue:'/'
  // })
  await queryInterface.addColumn("jobs", "deleted_by", {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "null",
  });
};

const jobdown = async () => {
  await queryInterface.removeConstraint("jobs", "jobs_deleted_by_fkey");
  await queryInterface.removeColumn("jobs", "deleted_by");
};

// Menudown()
// menuAddColumn();
// jobdown();
// jobaddColumn();

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

const addNewColumn = async () => {
  await queryInterface.addColumn("user", "password_expired", {
    type: DataTypes.BOOLEAN,
    defaultValue: "true",
  });
  await queryInterface.addColumn("comments", "status", {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  });
};

// addNewColumn()

// add new column to the forums

const addNewForumColumn = async () => {
  await queryInterface.addColumn("forums", "status", {
    type: DataTypes.ENUM("not-reviewed", "approved", "on-hold", "rejected"),
    allowNull: false,
    defaultValue: "not-reviewed",
  });
};

// addNewForumColumn();

const addNewBlogColumn = async () => {
  await queryInterface.addColumn("blog", "type", {
    type: DataTypes.ENUM("banner", "featured", "standard", "none"),
    allowNull: false,
    defaultValue: "none",
  });
};

const addNewPageColumn=async()=>{
  await queryInterface.addColumn('pages','meta_title',{
    type:DataTypes.STRING,
    allowNull:false,
    defaultValue:'sample Title'
  })
  await queryInterface.addColumn('pages','meta_description',{
    type:DataTypes.TEXT,
    allowNull:false,
    defaultValue:'sample Description'
  })

}

// addNewPageColumn();
// addNewBlogColumn();


const addNewPagesColumn=async()=>{
  // await queryInterface.addColumn('pages','is_dynamic',{
  //   type:DataTypes.BOOLEAN,
  //   allowNull:false,
  //   defaultValue:'true'
  // })
  await queryInterface.addColumn('pages','page_name',{
    type:DataTypes.STRING,
    defaultValue:'static pages'
  })
}


// addNewPagesColumn();

const addNewCategoryColumn=async()=>{
  await queryInterface.addColumn('blog_category','status',{
    type:DataTypes.INTEGER,
    defaultValue:1,
  })
}

// addNewCategoryColumn()


const updateBlogCategoryConstraint=async()=>{
  await queryInterface.removeConstraint('blog_category_map', 'blog_category_map_category_id_fkey');
  await queryInterface.addConstraint('blog_category_map', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'blog_category_map_category_id_fkey',
    references: {
      table: 'blog_category',
      field: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
  });
}

updateBlogCategoryConstraint()




