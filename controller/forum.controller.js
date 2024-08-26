const forumModel = require("../models/forum/forum.model");
const forumImgModel = require("../models/forum/forumImage.model");
const forumReplyModel = require("../models/forum/replies.model");
const userModel = require("../models/user.model");

const getAllForums = async (req, res) => {
  const limit = req?.query?.limit || 10;
  const page = req?.query?.page || 1;
  const offset = limit * (page - 1);

  try {
    const forums = await forumModel.findAll({
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userModel,
          foreignKey: "user_id",
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
              foreignKey: "user_id",
              as: "repliers",
              attributes: {
                exclude: ["password"],
              },
            },
          ],
        },
        {
          model: forumImgModel,
          foreignKey: "forum_id",
          as: "forum_img",
        },
      ],
    });

    res.render("forum/forums", { title: "Forums", data: forums });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// const getForumDetails = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const findForum = await forumModel.findByPk(id);

//     if (!findForum) {
//       return res.status(404).json({ err: "Forum not-found" });
//     }
//     res.render("", {});
//   } catch (error) {
//     res.status(500).json({ err: error.message });
//   }
// };

const createForum = async (req, res) => {
  const { title, short_description, description, published, premium } =
    req.body;

  try {
    if (title.length < 10 || title.length > 10) {
      return res
        .status(409)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    const create = await forumModel.create({
      title: title,
      short_description: short_description,
      description: description,
      published: published,
      premium: premium,
      author: req?.user?.id,
    });
    const forumImage = await forumImgModel.create({
      path: `/uploads/${req?.files[0]?.filename}`,
      fieldname: req?.files[0]?.fieldname,
      originalname: req?.files[0]?.originalname,
      encoding: req?.files[0]?.encoding,
      mimetype: req?.files[0]?.mimetype,
      destination: req?.files[0]?.destination,
      filename: req?.files[0]?.filename,
      size: req?.files[0]?.size,
    });

    res.status(200).json({ msg: "Forum Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateForum = async (req, res) => {
  const { id } = req.params;

  try {
    const findForum = await forumModel.findByPk(id);

    res.status(200).json({ msg: "Forum Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = { getAllForums, createForum };
