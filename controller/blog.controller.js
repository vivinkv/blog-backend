const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const blogCommentModel = require("../models/blogComment.model");
const blogSectionModel = require("../models/blogSection.model");
const userModel = require("../models/user.model");
const fs = require("fs");
require("dotenv").config();

//get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 15;
    const offset = (page - 1) * limit;
    const { count, rows } = await blogModel.findAndCountAll({
      order: [["createdAt", "DESC"]], // Order blogs by latest first
      limit: limit,
      offset: offset,
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as: "created_by",
          attributes: {
            exclude: ["password"],
          },
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
          include: [
            {
              model: userModel,
              foreignKey: "user_id",
              as: "user",
              attributes: {
                exclude: ["password"],
              },
            },
          ],
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
      where: {
        premium: false,
      },
    });

    res.json({
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalResults: count,
      nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
      nextPageUrl:
        page < Math.ceil(count / limit)
          ? `${process.env.BACKEND_URL}/blogs?page=${
              parseInt(page) + 1
            }&limit=${limit}`
          : null,
      previousePageUrl:
        page > 1
          ? `${process.env.BACKEND_URL}/blogs?page=${page - 1}&limit=${limit}`
          : null,
      firstPageUrl: `${process.env.BACKEND_URL}/blogs?page=1&limit=${limit}`,
      lastPageUrl: `${process.env.BACKEND_URL}/blogs?page=${Math.ceil(
        count / limit
      )}&limit=${limit}`,
      offset: offset,
      limit: limit,
      data: rows,
    });
  } catch (error) {
    res.json({ err: error.message });
  }
};

//get specific blog details
const getBlogDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await blogModel.findByPk(id, {
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as:'created_by',
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
          include:[{
            model:userModel,
            foreignKey:'user_id',
            as:'user'
          }],
          separate:true,
          order:[['createdAt','DESC']]
        },
      ],
    });
    if (!blog) {
      return res.status(404).json({ err: "Blog notfound" });
    }
    res.json({ data: blog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//creat new blog

const createBlog = async (req, res) => {
  const { title, description, is_published, premium, short_description } =
    req.body;
  console.log(req?.headers?.host);
  console.log(req?.body);
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    console.log(req?.headers);
    console.log(req.files);
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
      author: req.user.id,
      banner_id: bannerImage.dataValues.id,
    });

    res
      .status(200)
      .json({ data: createBlog.dataValues, msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//update existing blog
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

    const findBlogs = await blogModel.findAll({
      where: {
        banner_id: blog.dataValues.banner_id,
      },
    });

    if (req?.files.length > 0) {
      console.log("start");
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

// Delete existing blog
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
        const [banner, featured, og, sections, comments] = await Promise.all([
          bannerImageModel.findByPk(findBlog.dataValues.banner_id),
          bannerImageModel.findByPk(findBlog.dataValues.featured_id),
          bannerImageModel.findByPk(findBlog.dataValues.og_id),
          blogSectionModel.destroy({
            where: {
              blog_id: findBlog?.dataValues?.id,
            },
          }),
          blogCommentModel.destroy({
            where: {
              blog_id: findBlog?.dataValues?.id,
            },
          }),
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
        return res.status(200).json({ msg: "Deleted Successfully" });
      } else {
        findBlog.destroy();
        return res.status(200).json({ msg: "Deleted Successfully" });
      }
    } else {
      await findBlog.destroy();
      return res.status(200).json({ msg: "Deleted Successfully" });
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

const createComment = async (req, res) => {
  const { comment } = req.body;
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }

    const addComment = await blogCommentModel.create({
      comment: comment,
      user_id: req.user?.id,
      blog_id: id,
    });

    res.status(200).json({ msg: "Comment Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateComment = async (req, res) => {
  const { comment_id, id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }
    const findComment = await blogCommentModel.findOne({
      id: comment_id,
      user_id: req.user?.id,
    });

    if (!findComment) {
      return res.status(404).json({ err: "Comment not-found" });
    }
    console.log(req.body);

    await blogCommentModel.update(req.body, {
      where: {
        id: comment_id,
        blog_id: id,
        user_id: req?.user?.id,
      },
    });

    res.status(200).json({ msg: "Comment Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteComment = async (req, res) => {
  const { comment_id, id } = req.params;
  try {
    const findBlog = await blogModel.findByPk(id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }
    const findComment = await blogCommentModel.findOne({
      id: comment_id,
      blog_id:id,
      user_id: req.user?.id,
    });

    if (!findComment) {
      return res.status(404).json({ err: "Comment not-found" });
    }

    await findComment.destroy();

    res.status(200).json({ msg: "Comment Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  getAllBlogs,
  getBlogDetail,
  createBlog,
  updateBlog,
  deleteBlog,
  updateComment,
  createComment,
  deleteComment,
};
