const express = require("express");
const { getAllUsers } = require("../controller/user.controller");
const { adminAuth } = require("../middleware/auth.middleware");
const {
  login,
  createAdmin,
  getAllBlogs,
} = require("../controller/admin.controller");
const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", login);
router.use(adminAuth);
router.get("/blogs", getAllBlogs);
router.get("/users", getAllUsers);

module.exports = router;
