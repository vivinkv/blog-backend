const { DataTypes } = require('sequelize');
const sequelizeConfig=require('../config/sequelize.config');

const blogCommentModel=sequelizeConfig.define('comments',{
    id:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    comment:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    user_id:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null,
        references:{
            model:'user',
            key:'id'
        }
    },
    blog_id:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null,
        references:{
            model:'blog',
            key:'id'
        }
    }
},{
    freezeTableName:true,
    timestamps:true
})

module.exports=blogCommentModel