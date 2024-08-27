const express = require("express");
const { getAllUsers, createUser } = require("../controller/user.controller");
const { adminAuth } = require("../middleware/auth.middleware");
const {
  login,
  createAdmin,
  getAllBlogs,
  deleteBlog,
  deleteUser,
  dashboard,
  createBlog,
  getUpdateBlog,
  updateBlog,
  getUpdateUser,
  updateUser,
  duplicateBlog,
  getBlogDetail,
  getComments,
  deleteComment,
  postComment,
} = require("../controller/admin.controller");
const multer = require("multer");

const checkFileType = require("../utils/checkFileType");
const userModel = require("../models/user.model");
const { getAllForums, createForum, getUpdateForum, updateForum, deleteForum } = require("../controller/forum.controller");
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, (error, isValid, jsonError) => {
      if (isValid) {
        cb(null, true);
      } else {
        cb(error);
      }
    });
  },
});

const router = express.Router();
router.get("/create", async (req, res) => {
  const findAdmin = await userModel.findOne({
    where: {
      role: "admin",
    },
  });

  if (findAdmin) {
    res.redirect("/admin/login");
  } else {
    res.render("create", { title: "Create" });
  }
});
router.post("/create", createAdmin);

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
router.post("/login", login);
router.use(adminAuth);
router.get("/dashboard", dashboard);
router.get("/dashboard/blogs/create", (req, res) => {
  res.render("createblog", { title: "Create Blog" });
});

router.put("/dashboard/blogs/update/:id", upload.array("image", 3), updateBlog);
router.post("/dashboard/blogs/create", upload.array("image", 3), createBlog);
router.get("/dashboard/blogs", getAllBlogs);
// router.get('/dashboard/blogs/:id',getBlogDetail)
router.get("/dashboard/blogs/update/:id", getUpdateBlog);
router.get("/dashboard/blogs/delete/:id", deleteBlog);
router.get("/dashboard/blogs/duplicate/:id", duplicateBlog);
router.get('/dashboard/blog/:id/comments',getComments);
router.post('/dashboard/blog/:id/comments',postComment);
router.get('/dashboard/blog/:id/comments/:comment_id/delete',deleteComment);
router.get("/users", getAllUsers);
router.post("/users/create", createUser);
router.get("/dashboard/user/delete/:id", deleteUser);
router.get("/dashboard/user/update/:id", getUpdateUser);
router.put("/dashboard/user/update/:id", updateUser);
router.get("/dashboard/user/create", (req, res) => {
  res.render("createuser", { title: "Create User" });
});

// forums
router.get("/dashboard/forums", getAllForums);
router.get("/dashboard/forums/create", (req, res) => {
  res.render("forum/createforum", { title: "Create Forum" });
});
router.post("/dashboard/forums/create", upload.array("image", 3), createForum);
router.get("/dashboard/forums/update/:id", getUpdateForum);
router.put("/dashboard/forums/update/:id", upload.array("image", 3), updateForum);
router.get("/dashboard/forums/delete/:id", deleteForum);

// router.delete("/blogs/:id", deleteBlog);

// router.delete("/users/:id", deleteUser);
module.exports = router;
