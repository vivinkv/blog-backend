const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/sequelize.config");

const blogCategoryModel = sequelizeConfig.define("blog_category", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [5, 100],
        msg: "Name must be between 5 and 100 characters",
      },
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [10, 100],
        msg: "Title must be between 10 and 100 characters",
      },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [10],
        msg: "Title must be between 10 and 100 characters",
      },
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
},{
    freezeTableName:true,
    paranoid:true,
    timestamps:true
});

module.exports = blogCategoryModel;
