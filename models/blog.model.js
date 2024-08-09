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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

blogModel.associate = () => {
  blogModel.belongsTo(userModel, {
    foreignKey: "author",
  });

  userModel.hasMany(blogModel, {
    foreignKey: "author",
  });
};

module.exports = blogModel;
