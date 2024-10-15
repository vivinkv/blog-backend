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
    short_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: "false",
    },
    publish_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: Date.now(),
    },
    premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    banner_id: {
      type: DataTypes.STRING,
      references: {
        model: "blogimg",
        key: "id",
      },
    },
    featured_id: {
      type: DataTypes.STRING,
      references: {
        model: "blogimg",
        key: "id",
      },
    },
    og_id: {
      type: DataTypes.STRING,
      references: {
        model: "blogimg",
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
    top_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    bottom_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM(
        "user",
        "admin",
        "seo",
        "author",
        "member",
        "editor"
      ),
      allowNull: false,
      defaultValue: "user",
    },
    type: {
      type: DataTypes.ENUM("banner", "featured", "standard", "none"),
      allowNull: false,
      defaultValue: "none",
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

module.exports = blogModel;
