const sequelizeConfig = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");
const featuredImageModel = sequelizeConfig.define(
  "featuredimg",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = featuredImageModel;
