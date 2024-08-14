const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const featuredImageModel = require("../models/featuredImage.model");
const ogImageModel = require("../models/ogImage.model");
const userModel = require("../models/user.model");
const fs = require("fs");

//get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const page=req?.query?.page || 1;
    const limit=req?.query?.limit|| 15;
    const offset=(page-1)*limit;
    const {count,rows} = await blogModel.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit:limit,
      offset:offset,
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
      currentPage:page,
      totalPages:Math.ceil(count/limit),
      totalResults:count,
      nextPage:page+1,
      nextPageUrl:`${req?.headers?.host}/blogs?page=${parseInt(page)+1}&limit=${limit}`,
      previousePageUrl:page>1 ? `${req?.headers?.host}/blogs?page=${page-1}&limit=${limit}`:null,
      firstPageUrl:`${req?.headers?.host}/blogs?page=1&limit=${limit}`,
      lastPageUrl:`${req?.headers?.host}/blogs?page=${Math.ceil(count/limit)}&limit=${limit}`,
      offset:offset,
      limit:limit,
      data: rows});
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
    if(!blog){
      return res.status(404).json({err:"Blog notfound"})
    }
    res.json({ data: blog.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//creat new blog

const createBlog = async (req, res) => {
  const { title, description, status, premium, meta_title, meta_description } =
    req.body;
  console.log(req?.headers?.host);
  try {
    if (title?.length > 100 || title?.length < 10) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 100 characters" });
    }

    const bannerImage = await bannerImageModel.create({
      path: `${req?.headers?.host}/${req?.files[0]?.path}`,
      name: "Sample",
      alt: "sample",
    });
    const featuredImage = await featuredImageModel.create({
      path: `${req?.headers?.host}/${req?.files[1]?.path}`,
      name: "Sample",
      alt: "sample",
    });
    const ogImage = await ogImageModel.create({
      path: `${req?.headers?.host}/${req?.files[2]?.path}`,
      name: "Sample",
      alt: "sample",
    });
    const createBlog = await blogModel.create({
      title: title,
      description: description,
      status: status,
      premium: premium,
      meta_title: meta_title,
      meta_description: meta_description,
      author: req.user.id,
      banner_id: bannerImage.dataValues.id,
      featured_id: featuredImage.dataValues.id,
      og_id: ogImage.dataValues.id,
    });

    res.status(200).json({ data: createBlog.dataValues, msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
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

    if (!findBlog.dataValues.author == req.user.id) {
      return res.status(403).json({ data: "Update Permission Denied" });
    }

    await findBlog.update(req.body, {
      where: {
        id: id,
      },
    });

    res
      .status(200)
      .json({ data: findBlog.dataValues, msg: "Updated Successfully" });
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
    fs.unlink(findBlog?.dataValues?.bannerimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
    });
    fs.unlink(findBlog?.dataValues?.featuredimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
    });
    fs.unlink(findBlog?.dataValues?.ogimg?.path?.split("/")[1], (err) => {
      if (err) {
        return res.json({ err: err.message });
      }
    });

    const [banner, featured, og] = await Promise.all([
      bannerImageModel.findByPk(findBlog.dataValues.banner_id),
      featuredImageModel.findByPk(findBlog.dataValues.featured_id),
      ogImageModel.findByPk(findBlog.dataValues.og_id),
    ]);

    await Promise.all([
      findBlog.destroy(),
      banner.destroy(),
      featured.destroy(),
      og.destroy(),
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
