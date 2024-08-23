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

const blogModel = require("./models/blog.model");
const userModel = require("./models/user.model");
const cors = require("cors");
const featuredImageModel = require("./models/featuredImage.model");
const bannerImageModel = require("./models/bannerImage.model");
const ogImageModel = require("./models/ogImage.model");
const blogSectionModel = require("./models/blogSection.model");

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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//associations
userModel.hasMany(blogModel, { foreignKey: "author" });
blogModel.belongsTo(userModel, { foreignKey: "author" });

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

app.get("/", async (req, res) => {
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
          model:blogSectionModel,
          foreignKey:'blog_id',
          as:'sections'
        }
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
app.use("/admin", adminRoute);

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
