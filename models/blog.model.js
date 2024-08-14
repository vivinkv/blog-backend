const sequelizeConfig = require("../config/sequelize.config");
const userModel = require("./user.model");

const { DataTypes } = require("sequelize");

const blogModel = sequelizeConfig.define(
  "blog",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publish_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Date.now(),
    },
    premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    banner_id: {
      type: DataTypes.STRING,
      references: {
        model: "bannerimg",
        key: "id",
      },
    },
    featured_id: {
      type: DataTypes.STRING,
      references: {
        model: "featuredimg",
        key: "id",
      },
    },
    og_id: {
      type: DataTypes.STRING,
      references: {
        model: "ogimg",
        key: "id",
      },
    },
    author: {
      type: DataTypes.STRING,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

module.exports = blogModel;
