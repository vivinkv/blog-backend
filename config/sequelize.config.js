const {Sequelize}=require('sequelize');

console.log(process.env.USERNAME);

const sequelizeConfig=new Sequelize({
    port:process.env.DBPORT,
    host:process.env.HOST,
    username:process.env.USERNAME,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
    dialect:'postgres'
})

module.exports=sequelizeConfig;
