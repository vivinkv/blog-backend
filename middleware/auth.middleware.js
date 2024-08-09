const { verifyToken } = require("../utils/verifyToken");
const jwt=require('jsonwebtoken')

const userAuth = (req, res, next) => {
  try {
    if (req?.headers?.authorization) {
      console.log('working');
      const token = req?.headers?.authorization?.split(" ")[1];
  
      if (token == null) {
        return res.status(401).json({ err: "UnAuthorized Acess" });
      } else {
        const id = jwt.verify(token,process.env.JWT_SECRET_TOKEN);
        req.user = { id: id };
        next();
      }
    }else{
      return res.status(401).json({ err: "UnAuthorized Acess" });
    }
  } catch (error) {
    res.status(500).json({ err: error });
  }
 
};

module.exports = userAuth;
