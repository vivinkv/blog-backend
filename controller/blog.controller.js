const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
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
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
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
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    console.log(req?.headers);
    console.log(req.files);
    const bannerImage = await bannerImageModel.create({
      path: `${process.env.BACKEND_URL}/uploads/${req?.files[0]?.filename}`,
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
        path: `${process.env.BACKEND_URL}/uploads/${req?.files[0]?.filename}`,
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
    if (!findBlog.dataValues.author == req.user.id) {
      return res.status(403).json({ data: "Delete Permission Denied" });
    }

    //delete images

    if (
      fs.existsSync(
        `uploads/${findBlog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`
      )
    ) {
      fs.unlink(
        `/uploads/${findBlog?.dataValues?.bannerimg?.path?.split("/")?.pop()}`,
        (err) => {
          if (err) {
            return res.json({ err: err.message });
          }
        }
      );
    }

    const [banner, featured, og] = await Promise.all([
      bannerImageModel.findByPk(findBlog.dataValues.banner_id),
      featuredImageModel.findByPk(findBlog.dataValues.featured_id),
      ogImageModel.findByPk(findBlog.dataValues.og_id),
    ]);

    await Promise.all([
      findBlog.destroy(),
      banner?.destroy(),
      featured?.destroy(),
      og?.destroy(),
    ]);

    res
      .status(200)
      .json({ data: findBlog.dataValues, msg: "Deleted Successfully" });
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
};
