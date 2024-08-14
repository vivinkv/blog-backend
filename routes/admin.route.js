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
} = require("../controller/admin.controller");
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
router.get("/blogs", getAllBlogs);
router.get("/users", getAllUsers);
router.get("/users/create", createUser);
router.delete("/blogs/:id", deleteBlog);
router.delete("/users/:id", deleteUser);
module.exports = router;
