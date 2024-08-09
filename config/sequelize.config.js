require('dotenv').config();
const {Sequelize}=require('sequelize');

const sequelizeConfig=new Sequelize({
    port:process.env.DBPORT,
    host:process.env.HOST,
    username:process.env.USERNAME,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
    dialect:'postgres'
})

module.exports=sequelizeConfig;
