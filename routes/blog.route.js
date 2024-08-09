const {
  getBlogDetail,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controller/blog.controller");
const userAuth = require("../middleware/auth.middleware");
const express = require("express");
const router = express.Router();

router.use(userAuth);
router.get("/", getAllBlogs);
router.post("/", createBlog);
router.get("/:id", getBlogDetail);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports=router