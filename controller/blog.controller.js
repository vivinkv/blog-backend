const bannerImageModel = require("../models/bannerImage.model");
const blogModel = require("../models/blog.model");
const blogCategoryModel = require("../models/blogCategory.model");
const blogCategoryMapModel = require("../models/blogCategoryMap.model");
const blogCommentModel = require("../models/blogComment.model");
const blogFavouriteModel = require("../models/blogFavourite");
const blogLikeModel = require("../models/blogLike.model");
const blogReplyModel = require("../models/blogReply.model");
const blogSaveModel = require("../models/blogSave.model");
const blogSectionModel = require("../models/blogSection.model");
const blogTopicModel = require("../models/blogTopics.model");
const userModel = require("../models/user.model");
const fs = require("fs");
const slugify = require("slugify");

require("dotenv").config();

//get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Ensure `page` is an integer
    const limit = parseInt(req.query.limit) || 15; // Ensure `limit` is an integer
    const offset = (page - 1) * limit;

    const { count, rows } = await blogModel.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
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
      where: {
        premium: false,
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalResults: count,
      nextPage: page < totalPages ? page + 1 : null,
      nextPageUrl:
        page < totalPages
          ? `${process.env.BACKEND_URL}/blogs?page=${page + 1}&limit=${limit}`
          : null,
      previousPageUrl:
        page > 1
          ? `${process.env.BACKEND_URL}/blogs?page=${page - 1}&limit=${limit}`
          : null,
      firstPageUrl: `${process.env.BACKEND_URL}/blogs?page=1&limit=${limit}`,
      lastPageUrl: `${process.env.BACKEND_URL}/blogs?page=${totalPages}&limit=${limit}`,
      offset: offset,
      limit: limit,
      data: rows.length > 0 ? rows : null,
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//get specific blog details
const getBlogDetail = async (req, res) => {
  const { id } = req.params;
  console.log(req.query);
  try {
    const blog = await blogModel.findByPk(id, {
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
              as: "commented_by",
              attributes: {
                exclude: ["password"],
              },
            },
            {
              model: blogLikeModel,
              foreignKey: "comment_id",
              as: "likes",
              include: [
                {
                  model: userModel,
                  foreignKey: "user_id",
                  as: "liked_by",
                  attributes: {
                    exclude: ["password"],
                  },
                },
              ],
            },
            {
              model: blogReplyModel,
              foreignKey: "comment_id",
              as: "comment_replies",
              include: [
                {
                  model: userModel,
                  foreignKey: "user_id",
                  as: "replied_by",
                  attributes: {
                    exclude: ["password"],
                  },
                },
              ],
            },
          ],
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    const attachments = await bannerImageModel.findAll({
      where: {
        blog_id: id,
      },
    });
    const isBlogSaved = await blogSaveModel.findOne({
      where: {
        blog_id: id,
        user_id: req?.user?.id,
      },
    });
    const isLiked = await blogFavouriteModel.findOne({
      where: {
        blog_id: id,
        user_id: req?.user?.id,
      },
    });
    if (!blog) {
      return res.status(404).json({ err: "Blog notfound" });
    }
    res.json({
      data: blog.dataValues,
      attachments: attachments,
      isSaved: isBlogSaved ? true : false,
      isLiked: isLiked ? true : false,
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//creat new blog

const createBlog = async (req, res) => {
  const {
    title,
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
      description: top_description,
      is_published: is_published,
      premium: premium,
      short_description: short_description,
      top_description: top_description,
      bottom_description: bottom_description,
      author: req.user.id,
      banner_id: bannerImage.dataValues.id,
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

//update existing blog
const updateBlog = async (req, res) => {
  const {
    title,
    premium,
    short_description,
    is_published,
    top_description,
    bottom_description,
    sections,
  } = req.body;

  const { id } = req.params;
  const parseSection = JSON.parse(sections);

  try {
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }

    // Load the existing blog and its sections
    const blog = await blogModel.findByPk(id, {
      include: [
        {
          model: blogSectionModel,
          foreignKey: "blog_id",
          as: "sections",
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({ err: "Blog not found" });
    }

    const existingSections = blog.sections;

    // Track sections to delete and those already processed
    const sectionsToDelete = [...existingSections];
    const processedSectionIds = [];

    // Iterate over incoming sections to create or update
    for (let i = 0; i < parseSection.length; i++) {
      const section = parseSection[i];

      // Find a matching section in the existing sections by heading or some unique property
      const existingSection = existingSections.find(
        (existing) =>
          existing.heading === section.heading &&
          !processedSectionIds.includes(existing.id)
      );

      if (existingSection) {
        // Update existing section
        await blogSectionModel.update(
          {
            heading: section.heading,
            content: section.content,
            section_name: section.heading,
          },
          {
            where: {
              id: existingSection.id,
            },
          }
        );
        // Mark this section as processed
        processedSectionIds.push(existingSection.id);
        // Remove from deletion list
        sectionsToDelete.splice(sectionsToDelete.indexOf(existingSection), 1);
      } else {
        // Create a new section
        await blogSectionModel.create({
          blog_id: id,
          heading: section.heading,
          content: section.content,
          section_name: section.heading,
        });
      }
    }

    // Delete sections that were not processed (i.e., they are not in the incoming data)
    for (const section of sectionsToDelete) {
      await blogSectionModel.destroy({
        where: {
          id: section.id,
        },
      });
    }

    // Handle file upload and update blog details
    if (req?.files.length > 0) {
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

      const findBlogs = await blogModel.findAll({
        where: {
          banner_id: blog.dataValues.banner_id,
        },
      });

      if (findBlogs.length === 1) {
        const oldBannerPath = `uploads/${blog?.dataValues?.banner?.path
          ?.split("/")
          ?.pop()}`;
        if (fs.existsSync(oldBannerPath)) {
          try {
            await fs.promises.unlink(oldBannerPath);
            console.log("Deleted successfully");
          } catch (err) {
            return res.json({ err: err.message });
          }
        }
      }

      await blogModel.update(
        {
          title,
          description: top_description,
          short_description,
          is_published,
          premium,
          top_description,
          bottom_description,
          banner_id: bannerImage.dataValues.id,
        },
        {
          where: { id },
        }
      );

      return res.status(200).json({ msg: "Blog updated successfully" });
    }

    // Update the blog details without changing the banner
    await blogModel.update(
      {
        title,
        description: top_description,
        short_description,
        is_published,
        premium,
        top_description,
        bottom_description,
      },
      {
        where: { id },
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
              as: "commented_by",
              attributes: {
                exclude: ["password"],
              },
            },
            {
              model: blogLikeModel,
              foreignKey: "comment_id",
              as: "likes",
              include: [
                {
                  model: userModel,
                  foreignKey: "user_id",
                  as: "liked_by",
                  attributes: {
                    exclude: ["password"],
                  },
                },
              ],
            },
            {
              model: blogReplyModel,
              foreignKey: "comment_id",
              as: "comment_replies",
              include: [
                {
                  model: userModel,
                  foreignKey: "user_id",
                  as: "replied_by",
                  attributes: {
                    exclude: ["password"],
                  },
                },
              ],
            },
          ],
          separate: true,
          order: [["createdAt", "DESC"]],
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
  console.log(req?.params);

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
      where: {
        id: comment_id,
        blog_id: id,
        user_id: req.user?.id,
      },
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

//blog like controller

const createLike = async (req, res) => {
  const { comment_id } = req.params;
  try {
    const alreadyLiked = await blogLikeModel.findOne({
      where: {
        comment_id: comment_id,
        user_id: req?.user?.id,
      },
    });

    if (alreadyLiked) {
      return res.status(400).json({ err: "Already Liked" });
    }

    const createLike = await blogLikeModel.create({
      comment_id: comment_id,
      user_id: req?.user?.id,
    });

    res.status(201).json({ msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteLike = async (req, res) => {
  const { comment_id, like_id } = req.params;
  console.log({ id: like_id });
  try {
    const findLike = await blogLikeModel.findOne({
      where: {
        id: like_id,
        comment_id: comment_id,
        user_id: req?.user?.id,
      },
    });
    if (!findLike) {
      return res.status(404).json({ err: "Like not-found" });
    }
    await findLike.destroy();
    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//blog reply controller

const getReplies = async (req, res) => {
  const { comment_id } = req.params;
  try {
    const findComment = await blogCommentModel.findByPk(comment_id);
    if (!findComment) {
      return res.status(404).json({ err: "comment not-found" });
    }
    const replies = await blogReplyModel.findAll({
      where: {
        comment_id: comment_id,
      },
    });
    res.status(200).json({ data: replies });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const createReply = async (req, res) => {
  const { comment_id } = req.params;
  const { reply } = req.body;
  try {
    const findComment = await blogCommentModel.findByPk(comment_id);
    if (!findComment) {
      return res.status(404).json({ err: "Comment not-found" });
    }
    const createReply = await blogReplyModel.create({
      reply: reply,
      comment_id: comment_id,
      user_id: req?.user?.id,
    });

    res.status(201).json({ msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateReply = async (req, res) => {
  const { reply_id } = req.params;
  try {
    const findReply = await blogReplyModel.findByPk(reply_id);
    if (!findReply) {
      return res.status(404).json({ err: "Reply not-found" });
    }
    const updateReply = await blogReplyModel.update(req.body, {
      where: {
        id: reply_id,
      },
    });

    res.status(200).json({ msg: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteReply = async (req, res) => {
  const { reply_id } = req.params;
  try {
    const findReply = await blogReplyModel.findByPk(reply_id);
    if (!findReply) {
      return res.status(404).json({ err: "Reply not-found" });
    }
    await findReply.destroy();
    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAllSavedBlogs = async (req, res) => {
  try {
    const findAllBlogs = await blogSaveModel.findAll({
      where: {
        user_id: req?.user?.id,
      },
      include: [
        {
          model: blogModel,
          foreignKey: "blog_id",
          as: "saved",
          include: [
            {
              model: userModel,
              foreignKey: "user_id",
              as: "created_by",
              attributes: {
                exclude: ["password"],
              },
            },
          ],
        },
      ],
    });
    res.status(200).json({ data: findAllBlogs });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const createSaveBlog = async (req, res) => {
  const { blog_id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(blog_id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }

    const alreadySaved = await blogSaveModel.findOne({
      where: {
        blog_id: blog_id,
        user_id: req?.user?.id,
      },
    });

    if (alreadySaved) {
      return res.status(400).json({ err: "Already Saved" });
    }

    const createSave = await blogSaveModel.create({
      blog_id: blog_id,
      user_id: req?.user?.id,
    });
    res.status(201).json({ msg: "Saved Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteSavedBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const findSavedBlog = await blogSaveModel.findByPk(id);

    if (!findSavedBlog) {
      return res.status(404).json({ err: "Saved Blog not-found" });
    }

    await findSavedBlog.destroy();

    res.status(201).json({ msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//blog favourite
const createFavourite = async (req, res) => {
  const { id } = req.params;
  try {
    const alreadyLiked = await blogFavouriteModel.findOne({
      where: {
        blog_id: id,
        user_id: req?.user?.id,
      },
    });

    if (alreadyLiked) {
      return res.status(400).json({ err: "Already Liked" });
    }

    const createLike = await blogFavouriteModel.create({
      blog_id: id,
      user_id: req?.user?.id,
    });

    res.status(201).json({ msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteFavourite = async (req, res) => {
  const { id, favourite_id } = req.params;
  try {
    const findBlog = await blogModel.findByPk(id);

    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }
    const favourite = await blogFavouriteModel.findOne({
      where: {
        id: favourite_id,
        blog_id: id,
        user_id: req?.user?.id,
      },
    });
    if (!favourite) {
      return res.status(404).json({ err: "Not-found" });
    }

    await favourite.destroy();

    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getBlogCategories = async (req, res) => {
  try {
    const blogCategories = await blogCategoryModel.findAll({});
    res.render("category/index", {
      data: blogCategories,
      title: "Category List",
      query: {},
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getBlogCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlogCategory = await blogCategoryModel.findByPk(id);
    if (!findBlogCategory) {
      return res.status(404).json({ err: "Category not-found" });
    }
    res.render("category/update", { data: findBlogCategory.dataValues });
    // res.status(200).json({ data: findBlogCategory.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getBlogSpecificCategory = async (req, res) => {
  const { blog_id } = req.params;

  try {
    const findBlog = await blogModel.findByPk(blog_id);
    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }
    const findCategory = await blogModel.findAll({
      where: {
        id: blog_id,
      },
      include: [
        {
          model: blogCategoryModel,
          through: {
            attributes: [],
          },
        },
      ],
    });
    res.status(200).json({ data: findCategory });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error.message });
  }
};

const createBlogSpecificCategory = async (req, res) => {
  const { blog_id } = req.params;
  const { categoryId } = req.body;
  console.log(req.body);

  try {
    const findBlog = await blogModel.findByPk(blog_id);
    if (!findBlog) {
      return res.status(404).json({ err: "Blog not-found" });
    }

    const findBlogSpecificCategory = await blogCategoryMapModel.findOne({
      where: {
        blog_id: blog_id,
        category_id: categoryId,
      },
    });

    if (findBlogSpecificCategory) {
      return res.status(400).json({ msg: "Already Exist" });
    }

    await blogCategoryMapModel.create({
      blog_id: blog_id,
      category_id: categoryId,
    });
    res.status(201).json({ msg: "Created Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error.message });
  }
};

const deleteBlogSpecificCategory = async (req, res) => {
  const { blog_id } = req.params;
  const { categoryId } = req.body;

  try {
    const findBlogCategoryMap = await blogCategoryMapModel.findOne({
      where: {
        blog_id: blog_id,
        category_id: categoryId,
      },
    });
    if (!findBlogCategoryMap) {
      return res.status(404).json({ err: "Blog Specific Category not-found" });
    }
    await findBlogCategoryMap.destroy();

    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error.message });
  }
};

const createBlogCategory = async (req, res) => {
  const { title, description, name } = req.body;
  try {
    const createCategory = await blogCategoryModel.create({
      title,
      description,
      name,
      slug: slugify(title, {
        replacement: "-",
        remove: undefined,
        lower: false,
        strict: false,
        trim: true,
      }),
      meta_title: title,
      meta_description: description,
    });

    res.status(201).json({ msg: "Category Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateBlogCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const findBlogCategory = await blogCategoryModel.findByPk(id);
    if (!findBlogCategory) {
      return res.status(404).json({ err: "Category not-found" });
    }
    await blogCategoryModel.update(
      {
        title: req?.body.title,
        description: req?.body?.description,
        name: req?.body.name,
        slug: slugify(req?.body?.title, {
          replacement: "-",
          remove: undefined,
          lower: false,
          strict: false,
          trim: true,
        }),
        meta_title: req?.body.title,
        meta_description: req?.body?.description,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).json({ msg: "Update Category Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteBlogCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const findBlogCategory = await blogCategoryModel.findByPk(id);
    if (!findBlogCategory) {
      return res.status(404).json({ err: "Category not-found" });
    }
    await findBlogCategory.destroy();
    res.status(200).json({ msg: "Deleted Successfully" });
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
  createLike,
  deleteLike,
  getReplies,
  createReply,
  updateReply,
  deleteReply,
  getAllSavedBlogs,
  createSaveBlog,
  deleteSavedBlog,
  createFavourite,
  deleteFavourite,
  getBlogCategories,
  getBlogCategory,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogSpecificCategory,
  createBlogSpecificCategory,
  deleteBlogSpecificCategory,
};
