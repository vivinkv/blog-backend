const { DataTypes } = require('sequelize');
const sequelizeConfig=require('../../config/sequelize.config');

const jobModel=sequelizeConfig.define('jobs',{
    id:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    responsibilities:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    last_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    benefits:{
        type:DataTypes.TEXT,
        allowNull:true,
        defaultValue:'null'
    },
    requirements:{
        type:DataTypes.TEXT,
        allowNull:false
    }
    
});

module.exports=jobModel;