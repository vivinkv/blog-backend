require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var emailValidator = require("email-validator");
var { passwordStrength } = require("check-password-strength");
const adminModel = require("../models/admin.model");
const userModel = require("../models/user.model");
const blogModel = require("../models/blog.model");
const bannerImageModel = require("../models/bannerImage.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
const { Op } = require("sequelize");

//Create a new User
const createAdmin = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const findAdmin = await userModel.findOne({
      where: {
        email: email,
      },
    });
  
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
      role:'admin'
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
        redirect:'/admin/dashboard'
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
        role:'admin'
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
        redirect: '/admin/dashboard',
      },
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAllBlogs = async (req, res) => {
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
    res.json({ data: blogs });
  } catch (error) {
    res.json({ err: error.message });
  }
};


const deleteBlog = async (req, res) => {
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
    fs.unlink(findBlog?.dataValues?.featuredimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
      console.log("Deleted successfully");
    });
    fs.unlink(findBlog?.dataValues?.ogimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
      console.log("Deleted successfully");
    });

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

    res
      .status(200)
      .json({ data: findBlog.dataValues, msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;

  try {
    if (req?.body?.title?.length > 100 || req?.body?.title?.length < 10) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 100 characters" });
    }
    const findBlog = await blogModel.findByPk(id);
    if (!findBlog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    if (!findBlog.dataValues.author == req.user.id) {
      return res.status(403).json({ data: "Update Permission Denied" });
    }

    await findBlog.update(req.body, {
      where: {
        id: id,
      },
    });

    res
      .status(200)
      .json({ data: findBlog.dataValues, msg: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await userModel.findByPk(id);
    if (!findUser) {
      return res.status(404).json({ err: "User not found" });
    }
    await findUser.destroy();
    res.json({ data: findUser.dataValues, msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};


const dashboard=async(req,res)=>{
  try {
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
    console.log({data:users});
    res.render('dashboard',{title:"Admin Dashboard",data:users})
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
 
}

module.exports = { createAdmin, login, getAllBlogs, deleteBlog, deleteUser,dashboard };
