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
} = require("../controller/admin.controller");
const multer = require("multer");

const checkFileType = require("../utils/checkFileType");
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
router.get("/create", (req, res) => {
  res.render("create", { title: "Create" });
});
router.post("/create", createAdmin);

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
router.post("/login", login);
router.use(adminAuth);
router.get("/dashboard", dashboard);
router.get("/dashboard/blogs/create", (req, res) => {
  res.render("createblog");
});

router.put("/blogs/update/:id", upload.array("image", 3), updateBlog);
router.post("/dashboard/blogs/create", upload.array("image", 3), createBlog);
router.get("/dashboard/blogs", getAllBlogs);
router.get("/dashboard/blogs/update/:id", getUpdateBlog);
router.get("/dashboard/blogs/delete/:id", deleteBlog);

router.get("/users", getAllUsers);
router.post("/users/create", createUser);
router.get("/dashboard/user/delete/:id", deleteUser);
router.get("/dashboard/user/update/:id", getUpdateUser);
router.put("/dashboard/user/update/:id", updateUser);
router.get("/dashboard/user/create", (req, res) => {
  res.render("createuser", { title: "Create User" });
});

// router.delete("/blogs/:id", deleteBlog);

// router.delete("/users/:id", deleteUser);
module.exports = router;
