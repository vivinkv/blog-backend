const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
const userModel = require("../models/user.model");

//get all blogs
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
          model:bannerImageModel,
          foreignKey:'banner_id'
        },
        {
          model:featuredImageModel,
          foreignKey:'featured_id'
        },
        {
          model:ogImageModel,
          foreignKey:'og_id'
        }

      ],
    });
    res.json({ data: blogs });
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
    res.json({ data: blog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//creat new blog

const createBlog = async (req, res) => {
  const { title, description, status, premium, meta_title, meta_description } =
    req.body;
  try {
    if (title.length > 100 || title.length < 10) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    const createBlog = await blogModel.create({
      title: title,
      description: description,
      status: status,
      premium: premium,
      meta_title: meta_title,
      meta_description: meta_description,
      author: req.user.id,
    });
    res.status(200).json({ data: createBlog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

//update existing blog
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

    await findBlog.update(req.body, {
      where: {
        id: id,
      },
    });

    res.status(200).json({ data: findBlog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

// Delete existing blog
const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(id);
    if (!findBlog) {
      return res.status(404).json({ err: "Blog notfound" });
    }

    await findBlog.destroy();

    res.status(200).json({ data: findBlog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

module.exports = {
  getAllBlogs,
  getBlogDetail,
  createBlog,
  updateBlog,
  deleteBlog,
};
