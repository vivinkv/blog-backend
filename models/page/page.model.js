const { DataTypes } = require('sequelize');
const sequelizeConfig=require('../../config/sequelize.config');

const pageModel=sequelizeConfig.define('pages',{
    id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    short_description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    top_description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    bottom_description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    is_published:{
        type:DataTypes.BOOLEAN,
        defaultValue:'false'
    }
},{
    freezeTableName:true,
    timestamps:true,
    paranoid:true
})

module.exports=pageModel