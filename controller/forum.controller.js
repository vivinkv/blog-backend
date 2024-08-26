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
    if (req?.query?.premium && req?.query?.published) {
      const forums = await forumModel.findAll({
        where: {
          premium: req?.query?.premium,
          published: req?.query?.published,
        },
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
          {
            model: forumImgModel,
            foreignKey: "forum_img",
            as: "forumimages",
          },
        ],
      });
      res.render("forum/forums", {
        data: forums,
        title: "Forums List",
        query: { premium: req?.query?.premium, publish: req?.query?.published },
      });
    } else {
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
          {
            model: forumImgModel,
            foreignKey: "forum_img",
            as: "forumimages",
          },
        ],
      });
      res.render("forum/forums", {
        data: forums,
        title: "Forums List",
        query: {},
      });
    }
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
  console.log("started");

  try {
    if (title.length < 10 || title.length > 100) {
      return res
        .status(409)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

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

    const create = await forumModel.create({
      title: title,
      short_description: short_description,
      description: description,
      published: published,
      premium: premium,
      author: req?.user?.id,
      forum_img: forumImage.dataValues.id,
    });

    console.log(create);

    res.status(200).json({ msg: "Forum Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateForum = async (req, res) => {
  const { id } = req.params;

  console.log(req?.query);

  try {

    if (req?.query?.publish) {
      console.log("yes");
      await forumModel.update(
        {
          published: req?.query?.publish == "true" ? false : true,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res.redirect("/admin/dashboard/forums");
      return;
    }
    if (req?.query?.premium) {
      console.log("yes");
      await forumModel.update(
        {
          premium: req?.query?.premium == "true" ? false : true,
        },
        {
          where: {
            id: id,
          },
        }
      );
      res.redirect("/admin/dashboard/forums");
      return;
    }

    const findForum = await forumModel.findByPk(id, {
      include: [
        {
          model: forumImgModel,
          foreignKey: "forum_img",
          as: "forumimages",
        },
      ],
    });

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
    const findForum = await forumModel.findByPk(id, {
      include: [
        {
          model: forumImgModel,
          foreignKey: "forum_img",
          as: "forumimages",
        },
      ],
    });

    if (req?.files?.length > 0) {
      const addNewForumImage = await forumImgModel.create({
        path: `/uploads/${req?.files[0]?.filename}`,
        fieldname: req?.files[0]?.fieldname,
        originalname: req?.files[0]?.originalname,
        encoding: req?.files[0]?.encoding,
        mimetype: req?.files[0]?.mimetype,
        destination: req?.files[0]?.destination,
        filename: req?.files[0]?.filename,
        size: req?.files[0]?.size,
      });
      console.log(
        `uploads/${findForum?.dataValues?.forumimages?.path?.split("/")?.pop()}`
      );

      if (
        fs.existsSync(
          `uploads/${findForum.dataValues.forumimages.path?.split("/")?.pop()}`
        )
      ) {
        console.log(
          `uploads/${findForum?.dataValues?.forumimages?.path
            ?.split("/")
            ?.pop()}`
        );
        fs.unlink(
          `uploads/${findForum?.dataValues?.forumimages?.path
            ?.split("/")
            ?.pop()}`,

          (err) => {
            if (err) {
              return res.json({ err: err.message });
            }
            console.log("Deleted successfully");
          }
        );
      }

      const updateForum = await forumModel.update(
        {
          title: req?.body?.title,
          short_description: req?.body?.short_description,
          description: req?.body?.description,
          published: req?.body?.published,
          premium: req?.body?.premium,
          forum_img: addNewForumImage.dataValues.id,
        },
        {
          where: {
            id: id,
          },
        }
      );

      return res.status(200).json({ msg: "Updated Successfully" });
    } else {
      const updateForum = await forumModel.update(
        {
          title: req?.body?.title,
          short_description: req?.body?.short_description,
          description: req?.body?.description,
          published: req?.body?.published,
          premium: req?.body?.premium,
        },
        {
          where: {
            id: id,
          },
        }
      );

      return res.status(200).json({ msg: "Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteForum = async (req, res) => {
  const { id } = req.params;

  try {
    const findForum = await forumModel.findByPk(id, {
      include: [
        {
          model: forumImgModel,
          foreignKey: "forum_img",
          as: "forumimages",
        },
      ],
    });
    if (!findForum) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    const findForums = await forumModel.findAll({
      where: {
        forum_img: findForum.dataValues.forum_img,
      },
    });

    if (findForums.length == 1) {
      if (
        fs.existsSync(
          `uploads/${findForum?.dataValues?.forumimages?.path
            ?.split("/")
            ?.pop()}`
        )
      ) {
        //delete images
        fs.unlink(
          `uploads/${findForum?.dataValues?.forumimages?.path
            ?.split("/")
            ?.pop()}`,
          (err) => {
            if (err) {
              return res.json({ err: err.message });
            }
            console.log("Deleted successfully");
          }
        );
      }

      if (!findForum.dataValues?.title?.startsWith("Draft")) {
        findForum.destroy();
        res.redirect("/admin/dashboard/forums");
      } else {
        findForum.destroy();
        res.redirect("/admin/dashboard/blogs");
      }
    } else {
      await findForum.destroy();
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

module.exports = {
  getAllForums,
  createForum,
  getUpdateForum,
  updateForum,
  deleteForum,
};
