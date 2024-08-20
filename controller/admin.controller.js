require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var emailValidator = require("email-validator");
var { passwordStrength } = require("check-password-strength");
const userModel = require("../models/user.model");
const blogModel = require("../models/blog.model");
const bannerImageModel = require("../models/bannerImage.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
const { Op } = require("sequelize");
const fs = require("fs");

//Create a new User
const createAdmin = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const findAdmin = await userModel.findOne({
      where: {
        role: "admin",
      },
    });

    if (findAdmin) {
      return res.status(401).json({ err: "Admin Already Exists" });
    }

    const findEmail = await userModel.findOne({
      where: {
        email: email,
      },
    });
    if (findEmail) {
      return res.status(401).json({ err: "Email Already Exists" });
    }

    if (!emailValidator.validate(email) || email.length > 20) {
      return res
        .status(400)
        .json({ type: "email", err: "Please Enter Valid Email" });
    }
    if (email.length < 12) {
      return res
        .status(400)
        .json({ type: "email", err: "Email must contain 12 characters" });
    }

    if (passwordStrength(password).id < 2) {
      return res
        .status(400)
        .json({ type: "password", err: "Please Enter Strong Password" });
    } else if (password.length > 20 || password.length < 6) {
      return res
        .status(400)
        .json({ type: "password", err: "Please Enter Valid Password" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = await userModel.create({
      name: name,
      email: email,
      password: hashPassword,
      role: "admin",
    });

    const token = jwt.sign(
      createUser.dataValues.id,
      process.env.JWT_SECRET_TOKEN
    );

    res.cookie("admin", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.status(201).json({
      user: {
        id: createUser.dataValues.id,
        email: createUser.dataValues.email,
        name: createUser.dataValues.name,
        token: token,
        redirect: "/admin/dashboard",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error.message });
  }
};

//login

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const findAdmin = await userModel.findOne({
      where: {
        email: email,
        role: "admin",
      },
    });

    if (!findAdmin) {
      return res.status(404).json({ type: "email", err: "Invalid Email" });
    }

    const checkPassword = await bcrypt.compare(
      password,
      findAdmin.dataValues.password
    );

    if (!checkPassword) {
      return res.status(401).json({ type: "password", err: "Wrong Password" });
    }

    const token = jwt.sign(
      findAdmin.dataValues.id,
      process.env.JWT_SECRET_TOKEN
    );
    res.cookie("admin", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({
      user: {
        id: findAdmin.dataValues.id,
        name: findAdmin.dataValues.name,
        email: findAdmin.dataValues.email,
        token: token,
        redirect: "/admin/dashboard",
      },
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  console.log(req?.query);
  try {
    if (req?.query?.premium && req?.query?.published) {
      const blogs = await blogModel.findAll({
        where: {
          premium: req?.query?.premium,
          is_published: req?.query?.published,
        },
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
      res.render("blogs", { data: blogs, title: "Blogs List" });
    } else {
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
      res.render("blogs", { data: blogs, title: "Blogs List" });
    }
  } catch (error) {
    res.json({ err: error.message });
  }
};

const createBlog = async (req, res) => {
  const { title, description, is_published, premium, short_description } =
    req.body;
  console.log(req?.headers?.host);
  console.log(req?.files);
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }
    console.log(req?.url);
    console.log(req?.headers);
    const bannerImage = await bannerImageModel.create({
      path: `${process.env.BACKEND_URL}/uploads/${req?.files[0]?.filename}`,
      fieldname: req?.files[0]?.fieldname,
      originalname: req?.files[0]?.originalname,
      encoding: req?.files[0]?.encoding,
      mimetype: req?.files[0]?.mimetype,
      destination: req?.files[0]?.destination,
      filename: req?.files[0]?.filename,
      size: req?.files[0]?.size,
    });

    const createBlog = await blogModel.create({
      title: title,
      description: description,
      is_published: is_published,
      premium: premium,
      short_description: short_description,
      author: req.user.id,
      banner_id: bannerImage.dataValues.id,
      role: "admin",
    });

    res
      .status(200)
      .json({ data: createBlog.dataValues, msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findOne({
      where: {
        id: id,
      },
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
    console.log(findBlog);
    if (!findBlog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    const findBlogs = await blogModel.findAll({
      where: {
        banner_id: findBlog.dataValues.banner_id,
      },
    });

    console.log(findBlogs.length);
    if (findBlogs.length == 1) {
      if (
        fs.existsSync(
          `uploads/${findBlog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`
        )
      ) {
        //delete images
        fs.unlink(
          `uploads/${findBlog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`,
          (err) => {
            if (err) {
              return res.json({ err: err.message });
            }
            console.log("Deleted successfully");
          }
        );
      }

      if (!findBlog.dataValues?.title?.startsWith("Draft")) {
        const [banner, featured, og] = await Promise.all([
          bannerImageModel.findByPk(findBlog.dataValues.banner_id),
          featuredImageModel.findByPk(findBlog.dataValues.featured_id),
          ogImageModel.findByPk(findBlog.dataValues.og_id),
        ]);

        await Promise.all([
          findBlog.destroy(),
          banner?.destroy(),
          featured?.destroy(),
          og?.destroy(),
        ]);

        // res
        //   .status(200)
        //   .json({ data: findBlog.dataValues, msg: "Deleted Successfully" });
        res.redirect("/admin/dashboard/blogs");
      } else {
        findBlog.destroy();
        res.redirect("/admin/dashboard/blogs");
      }
    } else {
      await findBlog.destroy();
      res.redirect("/admin/dashboard/blogs");
    }

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
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateBlog = async (req, res) => {
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
    res.render("updateblog", { data: blog.dataValues, title: "Update Blog" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateBlog = async (req, res) => {
  const { title, description, premium, short_description, is_published } =
    req.body;
  console.log(req.body);
  const { id } = req.params;
  console.log(req.body);
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }
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

    const findBlogs = await blogModel.findAll({
      where: {
        banner_id: blog.dataValues.banner_id,
      },
    });

    if (req?.files.length > 0) {
      console.log("start");
      const bannerImage = await bannerImageModel.create({
        path: `${process.env.BACKEND_URL}/uploads/${req?.files[0]?.filename}`,
        fieldname: req?.files[0]?.fieldname,
        originalname: req?.files[0]?.originalname,
        encoding: req?.files[0]?.encoding,
        mimetype: req?.files[0]?.mimetype,
        destination: req?.files[0]?.destination,
        filename: req?.files[0]?.filename,
        size: req?.files[0]?.size,
      });

      console.log(bannerImage);
      console.log("middle");
      if (findBlogs.length == 1) {
        if (
          fs.existsSync(
            `uploads/${blog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`
          )
        ) {
          fs.unlink(
            `uploads/${blog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`,
            (err) => {
              if (err) {
                return res.json({ err: err.message });
              }
              console.log("Deleted successfully");
            }
          );
        }
      }

      const updateBlog = await blogModel.update(
        {
          title: title,
          description: description,
          short_description: short_description,
          is_published: is_published,
          premium: premium,
          author: req.user.id,
          banner_id: bannerImage.dataValues.id,
        },
        {
          where: {
            id: id,
          },
        }
      );
      console.log("end");
      return res
        .status(200)
        .json({ data: updateBlog.dataValues, msg: "Updated Successfully" });
    }

    const updateBlog = await blogModel.update(
      {
        title: title,
        description: description,
        short_description: short_description,
        is_published: is_published,
        premium: premium,
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
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }

    res.render("updateuser", {
      data: findUser.dataValues,
      title: "Update User",
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract the ID from request parameters

  try {
    // Log the ID for debugging purposes
    console.log(`Attempting to delete user with ID: ${id}`);

    // Find the user by primary key (ID)
    const findUser = await userModel.findByPk(id);
    const findBlogs = await blogModel.findAll({
      where: {
        author: id,
      },
    });

    if (!findUser) {
      // If the user is not found, return a 404 error
      return res.status(404).json({ err: "User not found" });
    }

    // Log the user data for debugging purposes
    console.log(`Found user: ${JSON.stringify(findUser.dataValues)}`);

    // Delete the user from the database
    await findUser.destroy();

    // Redirect to the dashboard after successful deletion
    res.redirect("/admin/dashboard");
  } catch (error) {
    // Log the error for debugging purposes
    console.error(`Error deleting user: ${error.message}`);

    // Return a 500 error with the error message
    res.status(500).json({ err: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const phonePattern = /^[0-9]{10}$/;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }

    if (
      !emailValidator.validate(req?.body?.email) ||
      req?.body?.email.length > 20
    ) {
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
    res.json({ data: findUser.dataValues, msg: "Update Successfully" });
    // res.redirect("/admin/dashboard");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const dashboard = async (req, res) => {
  try {
    if (req?.query?.role) {
      const users = await userModel.findAll({
        where: {
          role: req?.query?.role,
        },
        attributes: {
          exclude: ["password"],
        },
      });
      // res.status(200).json({ data: users });
      console.log({ data: users });
      res.render("dashboard", { title: "Users List", data: users });
    } else {
      const users = await userModel.findAll({
        where: {
          role: {
            [Op.ne]: "admin",
          },
        },
        attributes: {
          exclude: ["password"],
        },
      });
      // res.status(200).json({ data: users });
      console.log({ data: users });
      res.render("dashboard", { title: "Users List", data: users });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const duplicateBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id);
    if (findBlog) {
      const createDuplicateBlog = await blogModel.create({
        title: `Draft - ${findBlog.dataValues.title}`,
        short_description: findBlog.dataValues.short_description,
        description: findBlog.dataValues.description,
        is_published: findBlog.dataValues.is_published,
        publish_date: findBlog.dataValues.publish_date,
        premium: findBlog.dataValues.premium,
        meta_title: findBlog.dataValues.meta_title,
        meta_description: findBlog.dataValues.meta_description,
        banner_id: findBlog.dataValues.banner_id,
        featured_id: findBlog.dataValues.featured_id,
        og_id: findBlog.dataValues.og_id,
        author: findBlog.dataValues.author,
        role: findBlog.dataValues.role,
      });
      res.redirect("/admin/dashboard/blogs");
    } else {
      res.status(404).json({ err: "Blog not-found" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  createAdmin,
  login,
  getAllBlogs,
  duplicateBlog,
  deleteBlog,
  deleteUser,
  dashboard,
  createBlog,
  getUpdateBlog,
  updateBlog,
  getUpdateUser,
  updateUser,
};
