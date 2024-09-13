const axios = require("axios");
const blogModel = require("../models/blog.model");
const blogCommentModel = require("../models/blogComment.model");
const userModel = require("../models/user.model");
const bannerImageModel = require("../models/bannerImage.model");
const { v4: uuidv4 } = require("uuid");
const storeImageOnServer = require("../utils/storeImagetoServer");
const path = require("path");
const fs = require("fs");

const getDetails = (req, res) => {
  res.render("import/index", {
    title: "Import Data",
    id: req.cookies.last_id ? req.cookies.last_id : "null",
  });
};

const addNewBlogs = async (req, res) => {
  const { count, startId, domain, module } = req.body;

  try {
    switch (module) {
      case "blogs":
        try {
          const blogs = await axios.get(
            `${domain}/getresources.aspx?MaxCount=${count}&StartId=${startId}`
          );
          const beforeInsertionCount = await blogModel.count();

          for (const blog of blogs.data) {
            let user = await userModel.findOne({
              where: {
                email: blog.Member.Email,
              },
            });
            if (!user) {
              user = await userModel.create({
                id: blog.Member.ID.toString(),
                name: blog.Member.Name,
                email: blog.Member.Email,
                password: blog.Member.Passcrypt,
                user_id:
                  blog.Member.UserID == null
                    ? blog.Member.Email
                    : blog.Member.UserID,
                password_expired: "true",
              });
            }
            let findBlog = await blogModel.findOne({
              where: {
                id: blog.ID.toString(),
              },
            });
            if (!findBlog) {
              findBlog = await blogModel.create({
                id: blog.ID.toString(),
                title: blog.Title,
                meta_title: blog.MetaTitle,
                short_description: blog.MetaDescription,
                meta_description: blog.MetaDescription,
                description: blog.Description,
                author: user.dataValues.id,
                publish_date: blog.PostedDate,
                is_published: blog.PublishStatus,
              });
            }

            for (const attachments of blog.Attachments) {
              let attachment = await bannerImageModel.findOne({
                where: {
                  filename: attachments.Filename,
                },
              });

              if (!fs.existsSync(`uploads/${attachments.Filename}`)) {
                await storeImageOnServer(
                  `http://www.thehappyhomes.com/attachments/Resources/${attachments.Filename}`,
                  path.join('', "uploads","attachments","resources", attachments.Filename)
                );
                // await fs.promises.unlink(`uploads/${attachments.Filename}`);
              }

              if (!attachment) {
                attachment = await bannerImageModel.create({
                  blog_id: findBlog.dataValues.id,
                  fieldname: attachments.FileType,
                  originalname: attachments.Filename,
                  encoding: attachments.PostedMemberId,
                  mimetype: attachments.PostedMemberId,
                  destination: attachments.Filename,
                  filename: attachments.Filename,
                  path: `/uploads/attachments/resources/${attachments.Filename}`,
                  size:
                    attachments.Size == null
                      ? attachments.ResourceId
                      : attachments.Size,
                  image_type: "attachment",
                });
              }
            }
            for (const comments of blog.Responses) {
              let comment = await blogCommentModel.findOne({
                where: {
                  id: comments.ID.toString(),
                },
              });
              let commentedUser = await userModel.findOne({
                where: {
                  email: comments.Email,
                },
              });
              if (!commentedUser) {
                commentedUser = await userModel.create({
                  email: comments.Email,
                  password: uuidv4(),
                  name: comments.AuthorName,
                  user_id: comments.Email,
                });
              }
              if (!comment) {
                comment = await blogCommentModel.create({
                  id: comments.ID.toString(),
                  comment: comments.Description,
                  user_id: commentedUser.dataValues.id,
                  blog_id: findBlog.dataValues.id,
                  createdAt: comments.PostedDate,
                  status: comments.Status,
                });
              } else {
                comment = await blogCommentModel.update(
                  {
                    user_id: commentedUser.dataValues.id,
                  },
                  {
                    where: {
                      comment: comments.Description,
                      blog_id: findBlog.dataValues.id,
                    },
                  }
                );
              }
            }
          }

          const lastId = await blogModel.findOne({
            order: [["createdAt", "DESC"]],
          });
          res.cookie("last_id", lastId.dataValues.id, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            secure: true,
            httpOnly: true,
          });
          const afterInsertionCount = await blogModel.count();
          res.status(201).json({
            msg: "Blogs Created Successfully",
            query: `Query Run Successfully, ${
              afterInsertionCount - beforeInsertionCount
            } Rows Affected`,
            last_id: lastId.dataValues.id,
          });
        } catch (error) {
          console.log(error.message);
          res.status(500).json({ err: error.message });
        }

        break;

      default:
        res.status(404).json({ err: "Invalid API Module" });
        break;
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = { addNewBlogs, getDetails };
