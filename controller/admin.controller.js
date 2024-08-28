require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var emailValidator = require("email-validator");
var { passwordStrength } = require("check-password-strength");
const userModel = require("../models/user.model");
const blogModel = require("../models/blog.model");
const bannerImageModel = require("../models/bannerImage.model");
const { Op } = require("sequelize");
const fs = require("fs");
const blogSectionModel = require("../models/blogSection.model");
const blogCommentModel = require("../models/blogComment.model");
const blogLikeModel = require("../models/blogLike.model");
const blogReplyModel = require("../models/blogReply.model");

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

      const blogs = await blogModel.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: userModel,
            as: "created_by",
            attributes: { exclude: ["password"] },
          },
          {
            model: bannerImageModel,
            as: "banner",
          },
          {
            model: bannerImageModel,
            as: "featured",
          },
          {
            model: bannerImageModel,
            as: "og",
          },
          {
            model: blogSectionModel,
            as: "sections",
          },
          {
            model: blogCommentModel,
            as: "comments",
            include: [
              {
                model: userModel,
                as: "commented_by",
                attributes: { exclude: ["password"] },
              },
              {
                model: blogLikeModel,
                as: "likes",
                include: [
                  {
                    model: userModel,
                    as: "liked_by",
                    attributes: { exclude: ["password"] },
                  },
                ],
              },
              {
                model: blogReplyModel,
                as: "comment_replies",
                include: [
                  {
                    model: userModel,
                    as: "replied_by",
                    attributes: { exclude: ["password"] },
                  },
                ],
              },
            ],
            separate: true,
            order: [["createdAt", "DESC"]],
          },
        ],
      });
      res.render("blogs", { data: blogs, title: "Blogs List", query: {} });
    
  } catch (error) {
    res.json({ err: error.message });
  }
};

const getBlogDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }
    res.render("blogdetail", {
      blog: findBlog.dataValues,
      title: findBlog.dataValues.title,
    });
  } catch (err) {
    res.json({ err: err.message });
  }
};

const createBlog = async (req, res) => {
  const {
    title,
    description,
    is_published,
    premium,
    short_description,
    top_description,
    bottom_description,
    sections,
  } = req.body;
  const parseSection = JSON.parse(sections);
  console.log(req?.headers?.host);
  console.log(req?.files);
  console.log(JSON.parse(req?.body?.sections));
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }
    const bannerImage = await bannerImageModel.create({
      path: `/uploads/${req?.files[0]?.filename}`,
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
      top_description: top_description,
      bottom_description: bottom_description,
      author: req.user.id,
      banner_id: bannerImage.dataValues.id,
      role: "admin",
    });

    for (const section of parseSection) {
      try {
        const sectionData = await blogSectionModel.create({
          blog_id: createBlog.dataValues.id,
          heading: section?.heading,
          content: section?.content,
          section_name: section?.heading,
        });
        console.log(sectionData);
      } catch (error) {
        res.status(500).json({ err: error.message });
      }
    }

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
          as: "banner",
        },
        {
          model: bannerImageModel,
          foreignKey: "featured_id",
          as: "featured",
        },
        {
          model: bannerImageModel,
          foreignKey: "og_id",
          as: "og",
        },
      ],
    });
    if (!findBlog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    const findBlogs = await blogModel.findAll({
      where: {
        banner_id: findBlog.dataValues.banner_id,
      },
    });

    if (findBlogs.length == 1) {
      if (
        fs.existsSync(
          `uploads/${findBlog?.dataValues?.banner?.path?.split("/")?.pop()}`
        )
      ) {
        //delete images
        fs.unlink(
          `uploads/${findBlog?.dataValues?.banner?.path?.split("/")?.pop()}`,
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
          bannerImageModel.findByPk(findBlog.dataValues.featured_id),
          bannerImageModel.findByPk(findBlog.dataValues.og_id),
        ]);

        await Promise.all([
          findBlog.destroy(),
          banner?.destroy(),
          featured?.destroy(),
          og?.destroy(),
          blogSectionModel.destroy({
            where: {
              blog_id: findBlog.dataValues.id,
            },
          }),
          blogCommentModel.destroy({
            where: {
              blog_id: findBlog.dataValues.id,
            },
          }),
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
  console.log({ query: req?.query });
  try {
    if (req?.query?.publish) {
      console.log("yes");
      const updateBlog = await blogModel.update(
        {
          is_published: req?.query?.publish == "true" ? false : true,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res.redirect("/admin/dashboard/blogs");
      return;
    }
    if (req?.query?.premium) {
      console.log("yes");
      const updateBlog = await blogModel.update(
        {
          premium: req?.query?.premium == "true" ? false : true,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res.redirect("/admin/dashboard/blogs");
      return;
    }
    const blog = await blogModel.findByPk(id, {
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as: "created_by",
          attributes: ["id", "name", "email", "bio"],
        },
        {
          model: bannerImageModel,
          foreignKey: "banner_id",
          as: "banner",
        },
        {
          model: bannerImageModel,
          foreignKey: "featured_id",
          as: "featured",
        },
        {
          model: bannerImageModel,
          foreignKey: "og_id",
          as: "og",
        },
        {
          model: blogSectionModel,
          foreignKey: "blog_id",
          as: "sections",
        },
        {
          model: blogCommentModel,
          foreignKey: "blog_id",
          as: "comments",
        },
      ],
    });
    if (!blog) {
      return res.status(404).json({ err: "Blog notfound" });
    }
    res.render("updateblog", { data: blog.dataValues, title: "Update Blog" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    is_published,
    premium,
    short_description,
    top_description,
    bottom_description,
    sections,
  } = req.body;
  const parseSection = JSON.parse(sections);

  try {
    // Validate title length
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }

    // Find the blog to update
    const findBlog = await blogModel.findByPk(id, {
      include: [{ model: blogSectionModel, as: "sections" }],
    });

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not found" });
    }

    // Update the blog details
    await findBlog.update({
      title,
      description,
      is_published,
      premium,
      short_description,
      top_description,
      bottom_description,
      author: req.user.id,
      role: "admin",
    });

    // Update sections
    const existingSectionIds = findBlog.sections.map((section) => section.id);

    for (const section of parseSection) {
      if (section.id) {
        // Update existing section
        if (existingSectionIds.includes(section.id)) {
          await blogSectionModel.update(
            {
              heading: section.heading,
              content: section.content,
              section_name: section.heading,
            },
            { where: { id: section.id, blog_id: id } }
          );
        }
      } else {
        // Create new section
        await blogSectionModel.create({
          blog_id: id,
          heading: section.heading,
          content: section.content,
          section_name: section.heading,
        });
      }
    }

    // Delete sections that were removed
    const newSectionIds = parseSection.filter((section) => section.id).map((section) => section.id);
    const sectionsToDelete = existingSectionIds.filter((sectionId) => !newSectionIds.includes(sectionId));

    if (sectionsToDelete.length > 0) {
      await blogSectionModel.destroy({
        where: {
          id: sectionsToDelete,
          blog_id: id,
        },
      });
    }

    res.status(200).json({ msg: "Blog updated successfully" });
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
    const findBlog = await blogModel.findByPk(id, {
      include: [
        {
          model: blogSectionModel,
          foreignKey: "blog_id",
          as: "sections",
        },
      ],
    });

    if (findBlog) {
      // Create the duplicate blog
      const createDuplicateBlog = await blogModel.create({
        title: req?.query?.title,
        short_description: findBlog.dataValues.short_description,
        description: findBlog.dataValues.description,
        is_published: findBlog.dataValues.is_published,
        top_description: findBlog?.dataValues?.top_description,
        bottom_description: findBlog?.dataValues?.bottom_description,
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

      // Duplicate sections
      if (findBlog.sections && findBlog.sections.length > 0) {
        const sectionPromises = findBlog.sections.map((section) =>
          blogSectionModel.create({
            blog_id: createDuplicateBlog.id, 
            heading: section.heading,
            content: section.content,
            section_name:section.heading
          })
        );
        await Promise.all(sectionPromises);
      }

      res.redirect("/admin/dashboard/blogs");
    } else {
      res.status(404).json({ err: "Blog not found" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const findComments = await blogCommentModel.findAll({
      where: {
        blog_id: id,
      },
      include:[{
        model:userModel,
        foreignKey:'user_id',
        as:'user'
      }]
    });

    console.log(findComments);

    if (!findComments) {
      return res.status(404).json({ err: "Comments not-found" });
    }

    res.render('comments',{title:'Comments',data:findComments})
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const postComment=async(req,res)=>{
  const {id}=req.params;
  const {comment}=req.body;

  try {

    if(comment?.length<5){
      return res.status(409).json({err:'Comment must be at least 5 characters long.'})
    }

    const findBlog=await blogModel.findByPk(id);
    if(!findBlog){
      return res.status(404).json({err:"Blog notfound"});
    }
    const addComment = await blogCommentModel.create({
      comment: comment,
      user_id: req.user?.id,
      blog_id: id,
    });

    res.status(200).json({msg:'Comment Created Successfully'});

  } catch (error) {
    res.status(500).json({err:error.message})
  }

 



}

const deleteComment=async(req,res)=>{
  const {id,comment_id}=req.params;

  const findComment=await blogCommentModel.findByPk(comment_id);
  if(!findComment){
   return res.status(404).json({err:'Comment not-found'})
  }

  await findComment.destroy();
  res.redirect(`/admin/dashboard/blog/${id}/comments`)
}



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
  getBlogDetail,
  updateUser,
  getComments,
  deleteComment,
  postComment
};


