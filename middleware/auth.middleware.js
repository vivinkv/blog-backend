const { verifyToken } = require("../utils/verifyToken");
const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const adminModel = require("../models/admin.model");

const userAuth = async(req, res, next) => {
  try {
    if (req?.headers?.authorization) {
      const token = req?.headers?.authorization?.split(" ")[1];
  
      if (token == null) {
        return res.status(401).json({ err: "UnAuthorized Acess" });
      } else {
        const id = jwt.verify(token,process.env.JWT_SECRET_TOKEN);
        const findUser=await userModel.findByPk(id,{
          attributes:['name','email','id','bio']
        });
        if(!findUser){
          return res.status(401).json({ err: "UnAuthorized Acess" });
        }
        req.user = findUser.dataValues;
        next();
      }
    }else{
      return res.status(401).json({ err: "UnAuthorized Acess" });
    }
  } catch (error) {
    res.status(500).json({ err: error });
  }
 
};


const adminAuth=async(req,res,next)=>{
  try {
    if (req?.headers?.authorization) {
      const token = req?.headers?.authorization?.split(" ")[1];
  
      if (token == null) {
        return res.status(401).json({ err: "UnAuthorized Acess" });
      } else {
        const id = jwt.verify(token,process.env.JWT_SECRET_TOKEN);
        const findAdmin=await adminModel.findByPk(id,{
          attributes:['name','email','id']
        });
        if(!findAdmin){
          return res.status(401).json({ err: "UnAuthorized Acess" });
        }
        req.user = findAdmin.dataValues;
        console.log(req.user);
        next();
      }
    }else{
      return res.status(401).json({ err: "UnAuthorized Acess" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
}

module.exports = {userAuth,adminAuth};
