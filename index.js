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

const blogModel = require("./models/blog.model");
const userModel = require("./models/user.model");
const cors = require("cors");
const featuredImageModel = require("./models/featuredImage.model");
const bannerImageModel = require("./models/bannerImage.model");
const ogImageModel = require("./models/ogImage.model");
const blogSectionModel = require("./models/blogSection.model");
const blogCommentModel = require("./models/blogComment.model");
const forumModel = require("./models/forum/forum.model");
const forumReplyModel = require("./models/forum/replies.model");
const forumImgModel = require("./models/forum/forumImage.model");
const blogLikeModel = require("./models/blogLike.model");
const blogReplyModel = require("./models/blogReply.model");

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

//forum
userModel.hasMany(forumModel, { foreignKey: "author", as: "forum_user" });
forumModel.belongsTo(userModel, { foreignKey: "author", as: "forum_user" });

forumImgModel.hasOne(forumModel, {
  foreignKey: "forum_img",
  as: "forumimages",
});
forumModel.belongsTo(forumImgModel, {
  foreignKey: "forum_img",
  as: "forumimages",
});

forumModel.hasMany(forumReplyModel, { foreignKey: "forum_id", as: "replies" });
forumReplyModel.belongsTo(forumModel, {
  foreignKey: "forum_id",
  as: "replies",
});

userModel.hasMany(forumReplyModel, { foreignKey: "user_id", as: "repliers" });
forumReplyModel.belongsTo(userModel, { foreignKey: "user_id", as: "repliers" });

app.get("/", async (req, res) => {
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
    res.json({ err: error });
  }
});

app.use("/user", userRoute);
app.use("/blogs", blogRoute);

app.get("/:id", async (req, res) => {
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
      where: {
        premium: false,
      },
    });

    res.json({
      data: blogDetail,
    });
  } catch (error) {
    res.json({ err: error });
  }
});
app.use("/admin", adminRoute);
app.use("/api/forum", forumRoute);

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
