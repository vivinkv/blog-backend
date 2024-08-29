const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const queryInterface = sequelizeConfig.getQueryInterface();

// const changeColumn = async () => {
//   await queryInterface.removeConstraint("blog", "blog_featured_id_fkey"); // Remove existing foreign key constraint
//   await queryInterface.changeColumn("blog", "featured_id", {
//     type: DataTypes.STRING,
//     allowNull: true,
//   });
//   await queryInterface.addConstraint("blog", {
//     fields: ["featured_id"],
//     type: "foreign key",
//     name: "blog_featured_id_fkey", // Use the same name or a new one if needed
//     references: {
//       table: "bannerimg",
//       field: "id",
//     },
//     onUpdate: "CASCADE",
//     onDelete: "SET NULL", // or "CASCADE" depending on your needs
//   });

//   await queryInterface.removeConstraint("blog", "blog_og_id_fkey"); // Remove existing foreign key constraint
//   await queryInterface.changeColumn("blog", "og_id", {
//     type: DataTypes.STRING,
//     allowNull: true,
//     defaultValue: null,
//   });
//   await queryInterface.addConstraint("blog", {
//     fields: ["og_id"],
//     type: "foreign key",
//     name: "blog_og_id_fkey", // Use the same name or a new one if needed
//     references: {
//       table: "bannerimg",
//       field: "id",
//     },
//     onUpdate: "CASCADE",
//     onDelete: "SET NULL", // or "CASCADE" depending on your needs
//   });

// };

// changeColumn();

const add = async () => {
  await queryInterface.addConstraint('save', {
    fields: ['blog_id'],
    type: 'foreign key',
    name: 'save_blog_id_fkey',
    references: {
      table: 'blog',
      field: 'id'
    },
    onDelete: 'CASCADE', // Use 'SET NULL' if you prefer that behavior
    onUpdate: 'CASCADE'
  });
};

add();

const remove = async () => {
  await queryInterface.removeConstraint('save', 'save_blog_id_fkey');
};

//remove()
