const { DataTypes } = require("sequelize");
const sequelizeConfig = require("../../config/sequelize.config");

const forumModel = sequelizeConfig.define(
  "forums",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    published:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:'false'
    },
    premium:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:'false'
    },
    forum_img: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "forumimg",
        key: "id",
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports=forumModel
