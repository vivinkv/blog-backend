const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const blogCommentModel = require("../models/blogComment.model");
const blogSectionModel = require("../models/blogSection.model");
const forumModel = require("../models/forum/forum.model");
const forumImgModel = require("../models/forum/forumImage.model");
const forumReplyModel = require("../models/forum/replies.model");
const userModel = require("../models/user.model");
const fs = require("fs");

const getAllForums = async (req, res) => {
  const limit = req?.query?.limit || 10;
  const page = req?.query?.page || 1;
  const offset = limit * (page - 1);

  console.log(req.query);

  // try {

  try {
    const forums = await forumModel.findAll({
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as: "forum_user",
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: forumReplyModel,
          foreignKey: "forum_id",
          as: "replies",
          include: [
            {
              model: userModel,
              foreignKey: "author",
              as: "repliers",
              attributes: {
                exclude: ["password"],
              },
            },
          ],
        },
      ],
    });
    res.render("forum/forums", {
      data: forums,
      title: "Forums List",
      query: {},
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const createForum = async (req, res) => {
  const { title, description } = req.body;
  console.log("started");

  try {
    if (title.length < 10 || title.length > 100) {
      return res
        .status(409)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    const create = await forumModel.create({
      title: title,
      description: description,
      author: req?.user?.id,
    });

    res.status(200).json({ msg: "Forum Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateForum = async (req, res) => {
  const { id } = req.params;

  console.log(req?.query);

  try {
    const findForum = await forumModel.findByPk(id);

    if (!findForum) {
      return res.status(404).json({ err: "Forum not-found" });
    }

    res.render("forum/updateforum", {
      title: "Update Forum",
      data: findForum.dataValues,
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateForum = async (req, res) => {
  const { id } = req.params;

  console.log(req?.body);
  try {
    const findForum = await forumModel.findByPk(id);

    if (!findForum) {
      return res.status(404).json({ err: "Forum not-found" });
    }
    const updateForum = await forumModel.update(
      {
        title: req?.body?.title,
        description: req?.body?.description,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.status(200).json({ msg: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteForum = async (req, res) => {
  const { id } = req.params;

  try {
    const findForum = await forumModel.findByPk(id);
    if (!findForum) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    await findForum.destroy();
    res.redirect("/admin/dashboard/forums");

  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  getAllForums,
  createForum,
  getUpdateForum,
  updateForum,
  deleteForum,
};
