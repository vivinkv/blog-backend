const {
  getBlogDetail,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controller/blog.controller");
const { userAuth } = require("../middleware/auth.middleware");
const express = require("express");
const path = require("path");
const router = express.Router();
const multer = require("multer");
const checkFileType = require("../utils/checkFileType");
const storage = multer.diskStorage({
  destination: "./uploads/", // Folder to store uploaded images
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
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
router.use(userAuth);
router.get("/", getAllBlogs);
router.post("/", upload.array("image", 3), createBlog);
router.get("/:id", getBlogDetail);
router.put("/:id", upload.array("image", 3), updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
