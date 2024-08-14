const express = require("express");
const { getAllUsers } = require("../controller/user.controller");
const { adminAuth } = require("../middleware/auth.middleware");
const {
  login,
  createAdmin,
  getAllBlogs,
  deleteBlog,
  deleteUser,
} = require("../controller/admin.controller");
const router = express.Router();
router.get('/create',(req,res)=>{
  res.render('create',{title:"Create",css:"/login.css"})
})
router.post("/create", createAdmin);

router.get('/login',(req,res)=>{
  res.render('login',{title:"Login",css:"/login.css"})
})
router.post("/login", login);
router.use(adminAuth);
router.get("/blogs", getAllBlogs);
router.get("/users", getAllUsers);
router.delete("/blogs/:id", deleteBlog);
router.delete("/users/:id", deleteUser);
module.exports = router;
