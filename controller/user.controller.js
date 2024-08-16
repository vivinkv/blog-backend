require("dotenv").config();
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
var emailValidator = require("email-validator");
var { passwordStrength } = require("check-password-strength");

//Create a new User
const createUser = async (req, res) => {
  const { email, name, password, bio, role, phone } = req.body;
  const phonePattern = /^[0-9]{10}$/;
  try {
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
    const findUser = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (findUser) {
      return res
        .status(409)
        .json({ type: "email", err: "Email Already Exist" });
    }

    if (req.body?.phone) {
      if (!phonePattern.test(phone)) {
        return res
          .status(409)
          .json({ type: "phone", err: "Please Enter Valid Mobile Number" });
      }
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

    if (bio?.length > 70) {
      return res
        .status(400)
        .json({ type: "bio", err: "Bio must be less than 50 characters" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = await userModel.create({
      name: name,
      email: email,
      password: hashPassword,
      bio: bio || null,
      role: role,
      phone: phone,
    });

    const token = jwt.sign(
      createUser.dataValues.id,
      process.env.JWT_SECRET_TOKEN
    );
    return res.status(201).json({
      user: {
        id: createUser.dataValues.id,
        email: createUser.dataValues.email,
        name: createUser.dataValues.name,
        bio: createUser.dataValues.bio,
        token: token,
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
  console.log(req.file);

  try {
    const findUser = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      return res.status(404).json({ err: "Invalid Email" });
    }

    const checkPassword = await bcrypt.compare(
      password,
      findUser.dataValues.password
    );

    if (!checkPassword) {
      return res.status(401).json({ err: "Wrong Password" });
    }

    const token = jwt.sign(
      findUser.dataValues.id,
      process.env.JWT_SECRET_TOKEN
    );
    res.status(200).json({
      data: {
        id: findUser.dataValues.id,
        name: findUser.dataValues.name,
        email: findUser.dataValues.email,
        bio: findUser.dataValues.bio,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = { createUser, login, getAllUsers };
