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

const {
  AllFooterDesktop,
  AllFooterMobile,
  AllMainDesktop,
  AllMainMobile,
  createFooterDesktop,
  createFooterMobile,
  createMainDesktop,
  createMainMobile,
  deleteFooterDesktop,
  deleteFooterMobile,
  deleteMainDesktop,
  deleteMainMobile,
  updateFooterDesktop,
  updateFooterMobile,
  updateMainDesktop,
  updateMainMobile,
  getMainDesktopChild,
  getFooterDesktopDetail,
  getFooterMobileDetail,
  getMainMobileDetail,
} = require("../controller/menu.controller");

const checkFileType = require("../utils/checkFileType");
const userModel = require("../models/user.model");
const {
  getAllForums,
  createForum,
  getUpdateForum,
  updateForum,
  deleteForum,
} = require("../controller/forum.controller");
const {
  getAllJobs,
  updateJob,
  createJob,
  deleteJob,
  getUpdateJob,
} = require("../controller/career.controller");
const {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getUpdateService,
  duplicateService,
} = require("../controller/service.controller");
const { addNewBlogs, getDetails } = require("../controller/import.controller");
const {
  getAllSettings,
  getSettings,
  createSettings,
  updateSettings,
} = require("../controller/settings.controller");

const {createPage,deletePage,getAllPages,updatePage, getPageDetails}=require('../controller/page.controller');

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
router.get("/dashboard/blog/:id/comments", getComments);
router.post("/dashboard/blog/:id/comments", postComment);
router.get("/dashboard/blog/:id/comments/:comment_id/delete", deleteComment);
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
router.put(
  "/dashboard/forums/update/:id",
  upload.array("image", 3),
  updateForum
);
router.get("/dashboard/forums/delete/:id", deleteForum);

//career routes
router.get("/career", getAllJobs);
router.get("/career/create", (req, res) => {
  res.render("career/create", { title: "Create Job" });
});
router.post("/career/create", createJob);
router.get("/career/:id", getUpdateJob);
router.put("/career/:id", updateJob);
router.get("/career/:id/delete", deleteJob);

//service routes
router.get("/services", getAllServices);
router.get("/services/create", (req, res) => {
  res.render("service/create", { title: "Create Service" });
});
router.post("/services/create", createService);
router.get("/services/:id/update", getUpdateService);
router.put("/services/:id/update", updateService);
router.get("/services/:id/delete", deleteService);
router.get("/services/duplicate/:id", duplicateService);

// menu routes

const iconStorage = multer.diskStorage({
  destination: "./uploads/icons",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const iconUpload = multer({
  storage: iconStorage,
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

router.get("/menu", (req, res) => {
  res.render("menu/index", { title: "Menu" });
});
router.get("/menu/md", AllMainDesktop);
router.post("/menu/md", iconUpload.single("icon"), createMainDesktop);
router.get("/menu/md/:id", getMainDesktopChild);
router.put("/menu/md/:id", iconUpload.single("icon"), updateMainDesktop);
router.get("/menu/md/:id/delete", deleteMainDesktop);

router.get("/menu/fd", AllFooterDesktop);
router.post("/menu/fd", iconUpload.single("icon"), createFooterDesktop);
router.get("/menu/fd/:id", getFooterDesktopDetail);
router.put("/menu/fd/:id", iconUpload.single("icon"), updateFooterDesktop);
router.get("/menu/fd/:id/delete", deleteFooterDesktop);

router.get("/menu/mm", AllMainMobile);
router.post("/menu/mm", iconUpload.single("icon"), createMainMobile);
router.get("/menu/mm/:id", getMainMobileDetail);
router.put("/menu/mm/:id", iconUpload.single("icon"), updateMainMobile);
router.get("/menu/mm/:id/delete", deleteMainMobile);

router.get("/menu/fm", AllFooterMobile);
router.post("/menu/fm", iconUpload.single("icon"), createFooterMobile);
router.get("/menu/fm/:id", getFooterMobileDetail);
router.put("/menu/fm/:id", iconUpload.single("icon"), updateFooterMobile);
router.get("/menu/fm/:id/delete", deleteFooterMobile);

router.get("/import", getDetails);
router.post("/import/blogs", addNewBlogs);

const settingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/assets");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const settingsUpload = multer({
  storage: settingsStorage,
  fileFilter: (req, file, cb) => {
    // Your custom file type validation logic
    checkFileType(file, (error, isValid) => {
      if (isValid) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    });
  },
});


router.get("/settings", getAllSettings);
router.get("/settings/create", (req, res) => {
  res.render("settings/create", { title: "Create Settings" });
});
router.get("/settings/:id", getSettings);
router.post("/settings", settingsUpload.fields([
  { name: 'logo', maxCount: 1 }, 
  { name: 'favicon', maxCount: 1 }
]), createSettings);
router.put("/settings/:id", updateSettings);
router.get("/settings/:id/delete");


//pages
router.get('/pages',getAllPages);
router.get('/pages/create',(req,res)=>{
  res.render('page/create',{title:'Create Page'})
})
router.get('/pages/:id',getPageDetails);
router.post('/pages',createPage);
router.put('/pages/:id/update',updatePage);
router.get('/pages/:id/delete',deletePage);

module.exports = router;
