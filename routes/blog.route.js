const {
  getBlogDetail,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  createComment,
  deleteComment,
  updateComment,
  createLike,
  deleteLike,
  getReplies,
  createReply,
  updateReply,
  deleteReply,
  getAllSavedBlogs,
  createSaveBlog,
  deleteSavedBlog,
  createFavourite,
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
//authentication middleware
router.use(userAuth);
//routes

//saved
router.get('/saved',getAllSavedBlogs);
router.post('/saved/:blog_id',createSaveBlog);
router.delete('/saved/:id',deleteSavedBlog);

//blogs
router.get("/", getAllBlogs);
router.post("/", upload.array("image", 3), createBlog);
router.get("/:id", getBlogDetail);
router.put("/:id", upload.array("image", 3), updateBlog);
router.delete("/:id", deleteBlog);

//like blog
router.post('/:id/favourite',createFavourite);
router.delete('/:id/favourite/:favourite_id')

//comment
router.post("/:id/comment", createComment);
router.put("/:id/comment/:comment_id", updateComment);
router.delete("/:id/comment/:comment_id", deleteComment);

//likes
router.post("/:id/comment/:comment_id/like", createLike);
router.delete("/:id/comment/:comment_id/like/:like_id", deleteLike);

//reply
router.get("/:id/comment/:comment_id/reply", getReplies);
router.post("/:id/comment/:comment_id/reply", createReply);
router.put("/:id/comment/:comment_id/reply/:reply_id", updateReply);
router.delete("/:id/comment/:comment_id/reply/:reply_id", deleteReply);

module.exports = router;
