const axios = require("axios");
const blogModel = require("../models/blog.model");
const blogCommentModel = require("../models/blogComment.model");
const userModel = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");

const getDetails = (req, res) => {
  res.render("import/index", { title: "Import Data", id: req.cookies.last_id ? req.cookies.last_id : 'null' });
};

const addNewBlogs = async (req, res) => {
  const { count, startId, domain, module } = req.body;

  try {
    switch (module) {
      case "blogs":
        const blogs = await axios.get(
          `${domain}/getresources.aspx?MaxCount=${count}&StartId=${startId}`
        );
        const beforeInsertionCount = await blogModel.count();
        for (const blog of blogs.data) {
          for (const comment of blog.Responses) {
            let user = await userModel.findOne({
              where: {
                email: comment.Email,
              },
            });

            if (!user) {
              user = await userModel.create({
                email: comment.Email,
                password: uuidv4(),
                name: comment.AuthorName,
                user_id: comment.Email,
              });
            }

            const findComment = await blogCommentModel.findOne({
              where: {
                comment: comment.Description,
                blog_id: comment.ResourceId.toString(),
              },
            });

            if (!findComment) {
              const createComment = await blogCommentModel.create({
                comment: comment.Description,
                user_id: user.dataValues.id,
                blog_id: comment.ResourceId,
                createdAt: comment.PostedDate,
                status: comment.Status,
              });
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
           last_id:lastId.dataValues.id
        });

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
