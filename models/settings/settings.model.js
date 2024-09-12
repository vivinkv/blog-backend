const sequelizeConfig = require("../../config/sequelize.config");
const { DataTypes } = require("sequelize");
const settingsModel = sequelizeConfig.define(
  "settings",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  }
);


module.exports=settingsModel;
