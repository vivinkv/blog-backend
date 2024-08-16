const sequelizeConfig = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");
const blogModel = require("./blog.model");

const userModel = sequelizeConfig.define(
  "user",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone:{
      type:DataTypes.STRING,
      allowNull:true
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role:{
      type:DataTypes.ENUM('user','admin','seo','author','member','editor'),
      allowNull:false,
      defaultValue:'user'
    }
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

module.exports = userModel;
