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
var emailValidator = require("email-validator");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bannerImageModel = require("../models/bannerImage.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
const blogModel = require("../models/blog.model");
const checkFileType = require("../utils/checkFileType");
const { getBlogDetail } = require("../controller/blog.controller");
const userModel = require("../models/user.model");
const { title } = require("process");
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
router.post(
  "/dashboard/blogs/create",
  upload.array("image", 3),
  async (req, res) => {
    const {
      title,
      description,
      status,
      premium,
      meta_title,
      meta_description,
    } = req.body;
    console.log(req?.headers?.host);
    console.log(req?.file);
    try {
      if (title?.length > 100 || title?.length < 10) {
        return res
          .status(400)
          .json({ err: "Title must be between 10 and 100 characters" });
      }

      const bannerImage = await bannerImageModel.create({
        path: `${req?.headers?.host}/${req?.files[0]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const featuredImage = await featuredImageModel.create({
        path: `${req?.headers?.host}/${req?.files[1]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const ogImage = await ogImageModel.create({
        path: `${req?.headers?.host}/${req?.files[2]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const createBlog = await blogModel.create({
        title: title,
        description: description,
        status: "Published",
        premium: premium,
        meta_title: title,
        meta_description: meta_description,
        author: req.user.id,
        banner_id: bannerImage.dataValues.id,
        // featured_id: featuredImage.dataValues.id,
        // og_id: ogImage.dataValues.id,
        role: "admin",
      });

      res
        .status(200)
        .json({ data: createBlog.dataValues, msg: "Created Successfully" });
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  }
);

router.get("/dashboard/blogs", async (req, res) => {
  try {
    const blogs = await blogModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userModel,
          foreignKey: "author",
          attributes: ["id", "name", "email", "bio"],
        },
        {
          model: bannerImageModel,
          foreignKey: "banner_id",
        },
        {
          model: featuredImageModel,
          foreignKey: "featured_id",
        },
        {
          model: ogImageModel,
          foreignKey: "og_id",
        },
      ],
    });
    console.log(blogs[0].dataValues.bannerimg);
    res.render("blogs", { data: blogs, title: "Blogs List" });
  } catch (error) {
    res.json({ err: error.message });
  }
});

router.get("/users", getAllUsers);
router.post("/users/create", createUser);
router.get("/dashboard/blogs/update/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await blogModel.findByPk(id, {
      include: [
        {
          model: userModel,
          foreignKey: "author",
          attributes: ["id", "name", "email", "bio"],
        },
        {
          model: bannerImageModel,
          foreignKey: "banner_id",
        },
        {
          model: featuredImageModel,
          foreignKey: "featured_id",
        },
        {
          model: ogImageModel,
          foreignKey: "og_id",
        },
      ],
    });
    console.log(blog);
    if (!blog) {
      return res.status(404).json({ err: "Blog notfound" });
    }
    res.render("updateblog", { data: blog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.put("/blogs/update/:id", upload.array("image", 3), async (req, res) => {
  const { title, description, status, premium, meta_title, meta_description } =
    req.body;
  const { id } = req.params;
  console.log(req.body);
  try {
    const blog = await blogModel.findByPk(id, {
      include: [
        {
          model: userModel,
          foreignKey: "author",
          attributes: ["id", "name", "email", "bio"],
        },
        {
          model: bannerImageModel,
          foreignKey: "banner_id",
        },
        {
          model: featuredImageModel,
          foreignKey: "featured_id",
        },
        {
          model: ogImageModel,
          foreignKey: "og_id",
        },
      ],
    });
    if (!blog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    if (!req?.files) {
      console.log("working");
      const bannerImage = await bannerImageModel.create({
        path: `${req?.headers?.host}/${req?.files[0]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const featuredImage = await featuredImageModel.create({
        path: `${req?.headers?.host}/${req?.files[1]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const ogImage = await ogImageModel.create({
        path: `${req?.headers?.host}/${req?.files[2]?.path}`,
        name: "Sample",
        alt: "sample",
      });
      const updateBlog = await blogModel.update(
        {
          title: title,
          description: description,
          status: "Published",
          premium: premium,
          meta_title: title,
          meta_description: meta_description,
          author: req.user.id,
          banner_id: bannerImage.dataValues.id,
          // featured_id: featuredImage.dataValues.id,
          // og_id: ogImage.dataValues.id,
        },
        {
          where: {
            id: id,
          },
        }
      );

      res
        .status(200)
        .json({ data: updateBlog.dataValues, msg: "Updated Successfully" });
    } else {
      const updateBlog = await blogModel.update(
        {
          title: title,
          description: description,
          status: "Published",
          premium: premium,
          meta_title: title,
          meta_description: meta_description,
          author: req.user.id,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res
        .status(200)
        .json({ data: updateBlog.dataValues, msg: "Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});
router.get("/dashboard/blogs/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id, {
      include: [
        {
          model: bannerImageModel,
          foreignKey: "banner_id",
        },
        {
          model: featuredImageModel,
          foreignKey: "featured_id",
        },
        {
          model: ogImageModel,
          foreignKey: "og_id",
        },
      ],
    });
    if (!findBlog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    //delete images
    fs.unlink(findBlog?.dataValues?.bannerimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
      console.log("Deleted successfully");
    });
    // fs.unlink(findBlog?.dataValues?.featuredimg?.path?.split("/")[1], (err) => {
    //   if (err) {
    //     return res.json({ err: err.message });
    //   }
    //   console.log("Deleted successfully");
    // });
    // fs.unlink(findBlog?.dataValues?.ogimg?.path?.split("/")[1], (err) => {
    //   if (err) {
    //     return res.json({ err: err.message });
    //   }
    //   console.log("Deleted successfully");
    // });

    const [banner, featured, og] = await Promise.all([
      bannerImageModel.findByPk(findBlog.dataValues.banner_id),
      featuredImageModel.findByPk(findBlog.dataValues.featured_id),
      ogImageModel.findByPk(findBlog.dataValues.og_id),
    ]);

    await Promise.all([
      findBlog.destroy(),
      banner.destroy(),
      featured.destroy(),
      og.destroy(),
    ]);

    // res
    //   .status(200)
    //   .json({ data: findBlog.dataValues, msg: "Deleted Successfully" });
    res.redirect("/admin/dashboard/blogs");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});
router.delete("/blogs/:id", deleteBlog);

router.get("/dashboard/user/create", (req, res) => {
  res.render("createuser", { title: "create user" });
});

router.get("/dashboard/user/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }
    await findUser.destroy();
    // res.json({ data: findUser.dataValues, msg: "Deleted Successfully" });
    res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});
router.get("/dashboard/user/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }

    res.render("updateuser", {
      data: findUser.dataValues,
      title: "update user",
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});
router.put("/dashboard/user/update/:id", async (req, res) => {
  const { id } = req.params;
  const phonePattern = /^[0-9]{10}$/;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }

    if (!emailValidator.validate(req?.body?.email) || req?.body?.email.length > 20) {
      return res
        .status(400)
        .json({ type: "email", err: "Please Enter Valid Email" });
    }
    if (req?.body?.email.length < 12) {
      return res
        .status(400)
        .json({ type: "email", err: "Email must contain 12 characters" });
    }

    if (req.body?.phone) {
      if (!phonePattern.test(req.body?.phone)) {
        return res
          .status(409)
          .json({ type: "phone", err: "Please Enter Valid Mobile Number" });
      }
    }

    if (req?.body?.bio?.length > 70) {
      return res
        .status(400)
        .json({ type: "bio", err: "Bio must be less than 50 characters" });
    }

    await findUser.update(req.body, {
      where: {
        id: id,
      },
    });
    console.log({ findUser: findUser });
    res.json({ data: findUser.dataValues, msg: "Deleted Successfully" });
    // res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});
router.delete("/users/:id", deleteUser);
module.exports = router;
