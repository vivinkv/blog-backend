require("dotenv").config();
const express = require("express");
const path = require("path");
const sequelizeConfig = require("./config/sequelize.config");
const app = express();
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");

//routes
const userRoute = require("./routes/user.route");
const blogRoute = require("./routes/blog.route");
const adminRoute = require("./routes/admin.route");
const forumRoute = require("./routes/forum.route");
const careerRoute = require("./routes/career.route");
const serviceRoute = require("./routes/service.route");
const menuRoute = require("./routes/menu.route");
const blogCategoryRoute=require('./routes/category.route');

const blogModel = require("./models/blog.model");
const userModel = require("./models/user.model");
const cors = require("cors");
const bannerImageModel = require("./models/bannerImage.model");
const blogSectionModel = require("./models/blogSection.model");
const blogCommentModel = require("./models/blogComment.model");
const forumModel = require("./models/forum/forum.model");
const forumReplyModel = require("./models/forum/replies.model");
const forumImgModel = require("./models/forum/forumImage.model");
const blogLikeModel = require("./models/blogLike.model");
const blogReplyModel = require("./models/blogReply.model");
const blogSaveModel = require("./models/blogSave.model");
const blogTopicModel = require("./models/blogTopics.model");
const blogFavouriteModel = require("./models/blogFavourite");
const jobModel = require("./models/career/job.model");
const serviceModel = require("./models/service/service.model");
const serviceSectionModel = require("./models/service/section.model");
const applicantModel = require("./models/career/applicant.model");
const menuModel = require("./models/menu/menu.model");
const pageModel = require("./models/page/page.model");
const pageSectionModel = require("./models/page/section.model");
const pageSeoModel = require("./models/page/seo.model");
const notificationModel = require("./models/notification/notification.model");
const blogCategoryModel = require("./models/blogCategory.model");
const blogCategoryMapModel = require("./models/blogCategoryMap.model");

const errorHandler = require("./middleware/error.middleware");
const redirection = require("./middleware/redirection.middleware");
const { Op } = require("sequelize");

// const limiter = rateLimit({
//   windowMs: 60 * 1000,
//   limit: 200,
//   message: "Limit Exceeded, Try again later",
//   standardHeaders: "draft-6",
//   legacyHeaders: false,
//   handler: (req, res) => {
//     res.status(429).json({
//       error: "Too many requests",
//       message:
//         "You have exceeded the number of allowed requests. Please try again later.",
//       resetAfter: req.rateLimit.resetTime, // Optional: time when the rate limit will reset
//     });
//   },
// });

app.set("view engine", "ejs");
app.set("views", "./views");

//ejs setup

// app.use(limiter);
const allowedOrigins = [
  "http://localhost:3000",
  "https://swblogs.vercel.app",
  "http://localhost:5000",
  "https://blogs-23vc.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//associations
userModel.hasMany(blogModel, { foreignKey: "author", as: "created_by" });
blogModel.belongsTo(userModel, { foreignKey: "author", as: "created_by" });

bannerImageModel.hasOne(blogModel, {
  foreignKey: "featured_id",
  as: "featured",
});
blogModel.belongsTo(bannerImageModel, {
  foreignKey: "featured_id",
  as: "featured",
});

bannerImageModel.hasOne(blogModel, { foreignKey: "banner_id", as: "banner" });
blogModel.belongsTo(bannerImageModel, {
  foreignKey: "banner_id",
  as: "banner",
});

bannerImageModel.hasOne(blogModel, { foreignKey: "og_id", as: "og" });
blogModel.belongsTo(bannerImageModel, { foreignKey: "og_id", as: "og" });

blogModel.hasMany(blogSectionModel, { foreignKey: "blog_id", as: "sections" });
blogSectionModel.belongsTo(blogModel, {
  foreignKey: "blog_id",
  as: "sections",
});

blogModel.hasMany(blogFavouriteModel, {
  foreignKey: "blog_id",
  as: "favourite",
});
blogFavouriteModel.belongsTo(blogModel, {
  foreignKey: "blog_id",
  as: "favourite",
});

blogModel.hasMany(blogCommentModel, { foreignKey: "blog_id", as: "comments" });
blogCommentModel.belongsTo(blogModel, {
  foreignKey: "blog_id",
  as: "comments",
});

userModel.hasMany(blogCommentModel, {
  foreignKey: "user_id",
  as: "commented_by",
});
blogCommentModel.belongsTo(userModel, {
  foreignKey: "user_id",
  as: "commented_by",
});

blogCommentModel.hasMany(blogLikeModel, {
  foreignKey: "comment_id",
  as: "likes",
});
blogLikeModel.belongsTo(blogCommentModel, {
  foreignKey: "comment_id",
  as: "likes",
});

userModel.hasMany(blogLikeModel, { foreignKey: "user_id", as: "liked_by" });
blogLikeModel.belongsTo(userModel, { foreignKey: "user_id", as: "liked_by" });

blogCommentModel.hasMany(blogReplyModel, {
  foreignKey: "comment_id",
  as: "comment_replies",
});
blogReplyModel.belongsTo(blogCommentModel, {
  foreignKey: "comment_id",
  as: "comment_replies",
});

userModel.hasMany(blogReplyModel, { foreignKey: "user_id", as: "replied_by" });
blogReplyModel.belongsTo(userModel, {
  foreignKey: "user_id",
  as: "replied_by",
});

blogModel.hasMany(blogSaveModel, {
  foreignKey: "blog_id",
  onDelete: "SET NULL",
  as: "saved",
});
blogSaveModel.belongsTo(blogModel, { foreignKey: "blog_id", as: "saved" });

blogModel.hasMany(blogTopicModel, { foreignKey: "blog_id", as: "tags" });
blogTopicModel.belongsTo(blogModel, { foreignKey: "blog_id", as: "tags" });

blogModel.belongsToMany(blogCategoryModel, {
  foreignKey: "blog_id",
  through: blogCategoryMapModel,
  onUpdate:'CASCADE',
  onDelete:'CASCADE'
});
blogCategoryModel.belongsToMany(blogModel, {
  foreignKey: "category_id",
  through: blogCategoryMapModel,
  onUpdate:'CASCADE',
  onDelete:'CASCADE'
});

userModel.hasMany(jobModel, { foreignKey: "deleted_by", as: "deleted_user" });
jobModel.belongsTo(userModel, { foreignKey: "deleted_by", as: "deleted_user" });

//forum
userModel.hasMany(forumModel, { foreignKey: "author", as: "forum_user" });
forumModel.belongsTo(userModel, { foreignKey: "author", as: "forum_user" });

forumModel.hasMany(forumReplyModel, { foreignKey: "forum_id", as: "replies" });
forumReplyModel.belongsTo(forumModel, {
  foreignKey: "forum_id",
  as: "replies",
});

userModel.hasMany(forumReplyModel, { foreignKey: "user_id", as: "repliers" });
forumReplyModel.belongsTo(userModel, { foreignKey: "user_id", as: "repliers" });

userModel.hasMany(serviceModel, {
  foreignKey: "author",
  as: "service_created_by",
});
serviceModel.belongsTo(userModel, {
  foreignKey: "author",
  as: "service_created_by",
});

serviceModel.hasMany(serviceSectionModel, {
  foreignKey: "service_id",
  as: "service_sections",
});
serviceSectionModel.belongsTo(serviceModel, {
  foreignKey: "service_id",
  as: "service_sections",
});

//career association
jobModel.hasMany(applicantModel, { foreignKey: "job_id", as: "applications" });
applicantModel.belongsTo(jobModel, {
  foreignKey: "job_id",
  as: "applications",
});

menuModel.hasMany(menuModel, { foreignKey: "parent_id", as: "submenu" });
menuModel.belongsTo(menuModel, { foreignKey: "parent_id", as: "parentMenu" });

//pages

pageModel.hasMany(pageSectionModel, {
  foreignKey: "page_id",
  as: "page_sections",
});
pageSectionModel.belongsTo(pageModel, {
  foreignKey: "page_id",
  as: "page_sections",
});

pageModel.hasOne(pageSeoModel, { foreignKey: "page_id", as: "page_seo" });
pageSeoModel.belongsTo(pageModel, { foreignKey: "page_id", as: "page_seo" });

// notifications

userModel.hasMany(notificationModel, {
  foreignKey: "created_by",
  as: "notified_by",
});
notificationModel.belongsTo(userModel, {
  foreignKey: "created_by",
  as: "notified_by",
});

app.get("/", async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 15;
    const offset = (page - 1) * limit;

    const blogTypes = ["banner", "featured", "standard"];
    const blogData = {};

    for (const type of blogTypes) {
      blogData[type] = await blogModel.findAll({
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
            model: blogFavouriteModel,
            foreignKey: "blog_id",
            as: "favourite",
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
          {
            model: blogTopicModel,
            foreignKey: "blog_id",
            as: "tags",
          },
          {
            model: blogCategoryModel,
            foreignKey: "blog_id",
            as: "blog_categories",
            through: {
              attributes: [],
            },
          },
        ],
        where: {
          type: type,
          premium: false,
        },
      });
    }

    res.status(200).json(blogData);

    // const { count, rows } = await blogModel.findAndCountAll({
    //   order: [["createdAt", "DESC"]], // Order blogs by latest first
    //   limit: limit,
    //   offset: offset,
    //   include: [
    //     {
    //       model: userModel,
    //       foreignKey: "author",
    //       as: "created_by",
    //       attributes: {
    //         exclude: ["password"],
    //       },
    //     },
    //     {
    //       model: bannerImageModel,
    //       foreignKey: "banner_id",
    //       as: "banner",
    //     },
    //     {
    //       model: bannerImageModel,
    //       foreignKey: "featured_id",
    //       as: "featured",
    //     },
    //     {
    //       model: bannerImageModel,
    //       foreignKey: "og_id",
    //       as: "og",
    //     },
    //     {
    //       model: blogSectionModel,
    //       foreignKey: "blog_id",
    //       as: "sections",
    //     },
    //     {
    //       model: blogFavouriteModel,
    //       foreignKey: "blog_id",
    //       as: "favourite",
    //     },
    //     {
    //       model: blogCommentModel,
    //       foreignKey: "blog_id",
    //       as: "comments",
    //       include: [
    //         {
    //           model: userModel,
    //           foreignKey: "user_id",
    //           as: "commented_by",
    //           attributes: {
    //             exclude: ["password"],
    //           },
    //         },
    //         {
    //           model: blogLikeModel,
    //           foreignKey: "comment_id",
    //           as: "likes",
    //           include: [
    //             {
    //               model: userModel,
    //               foreignKey: "user_id",
    //               as: "liked_by",
    //               attributes: {
    //                 exclude: ["password"],
    //               },
    //             },
    //           ],
    //         },
    //         {
    //           model: blogReplyModel,
    //           foreignKey: "comment_id",
    //           as: "comment_replies",
    //           include: [
    //             {
    //               model: userModel,
    //               foreignKey: "user_id",
    //               as: "replied_by",
    //               attributes: {
    //                 exclude: ["password"],
    //               },
    //             },
    //           ],
    //         },
    //       ],
    //       separate: true,
    //       order: [["createdAt", "DESC"]],
    //     },
    //     {
    //       model: blogTopicModel,
    //       foreignKey: "blog_id",
    //       as: "tags",
    //     },
    //     {
    //       model: blogCategoryModel,
    //       as: "blog_categories",
    //       through: {
    //         model: blogCategoryMapModel,
    //         unique: false,
    //       },
    //     },
    //   ],
    //   where: {
    //     premium: false,
    //   },
    // });

    // res.json({
    //   currentPage: page,
    //   totalPages: Math.ceil(count / limit),
    //   totalResults: count,
    //   nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
    //   nextPageUrl:
    //     page < Math.ceil(count / limit)
    //       ? `${process.env.BACKEND_URL}/blogs?page=${
    //           parseInt(page) + 1
    //         }&limit=${limit}`
    //       : null,
    //   previousePageUrl:
    //     page > 1
    //       ? `${process.env.BACKEND_URL}/blogs?page=${page - 1}&limit=${limit}`
    //       : null,
    //   firstPageUrl: `${process.env.BACKEND_URL}/blogs?page=1&limit=${limit}`,
    //   lastPageUrl: `${process.env.BACKEND_URL}/blogs?page=${Math.ceil(
    //     count / limit
    //   )}&limit=${limit}`,
    //   offset: offset,
    //   limit: limit,
    //   data: rows,
    // });
  } catch (error) {
    res.json({ err: error.message });
  }
});

app.use("/user", userRoute);
app.use("/blogs", blogRoute);
app.use('/category',blogCategoryRoute);
app.get("/contact", async (req, res) => {
  const contactDetails = await pageModel.findOne({
    where: {
      page_name: {
        [Op.iLike]: '%contact%'
      },
    },
  });

  res.json({data:contactDetails.dataValues})
});

app.get('/test',async(req,res)=>{
  const { count, rows } = await blogModel.findAndCountAll({
      order: [["createdAt", "DESC"]], // Order blogs by latest first
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
          model: blogFavouriteModel,
          foreignKey: "blog_id",
          as: "favourite",
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
        {
          model: blogTopicModel,
          foreignKey: "blog_id",
          as: "tags",
        },
        {
          model: blogCategoryModel,
          as: "blog_categories",
          through: {
            model: blogCategoryMapModel,
            unique: false,
          },
        },
      ],
      where: {
        premium: false,
      },
    });

    res.json({
      totalResults: count,
      data: rows,
    });
})

app.get('/allblogs',async(req,res)=>{
  try {
    const blogs=await blogModel.findAll({
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
          model: blogFavouriteModel,
          foreignKey: "blog_id",
          as: "favourite",
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
        {
          model: blogTopicModel,
          foreignKey: "blog_id",
          as: "tags",
        },
        {
          model: blogCategoryModel,
          as: "blog_categories",
          through: {
            model: blogCategoryMapModel,
            unique: false,
          },
        },
      ],
    })

    res.status(200).json({data:blogs})
  } catch (error) {
    res.status(500).json({err:error.message})
  }
})

app.get('/msg',(req,res)=>{
  res.json({msg:'Server Run Successfully'})
})

app.get("/:id", async (req, res) => {
  console.log(req?.user);
  try {
    const { id } = req.params;
    const blogDetail = await blogModel.findByPk(id, {
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
          model: blogFavouriteModel,
          foreignKey: "blog_id",
          as: "favourite",
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
        {
          model: blogTopicModel,
          foreignKey: "blog_id",
          as: "tags",
        },
        {
          model: blogCategoryModel,
          as: "blog_categories",
          through: {
            model: blogCategoryMapModel,
            unique: true,
          },
        },
      ],
      where: {
        premium: false,
      },
    });
    const attachments = await bannerImageModel.findAll({
      where: {
        blog_id: id,
      },
    });

    res.json({
      data: blogDetail,
      attachments: attachments,
    });
  } catch (error) {
    res.json({ err: error });
  }
});

// app.use(redirection);
app.use("/admin", adminRoute);
app.use("/api/forum", forumRoute);
app.use("/api/career", careerRoute);
app.use("/api/services", serviceRoute);
app.use("/api/menu", menuRoute);

sequelizeConfig.authenticate();
sequelizeConfig
  .sync()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on PORT: ${process.env.PORT}`);
    });
    console.log("All Tables Created Successfully");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
