require("dotenv").config();
const express = require("express");
const path = require("path");
const sequelizeConfig = require("./config/sequelize.config");
const app = express();
const cookieParser = require("cookie-parser");
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

app.set("view engine", "ejs");
app.set("views", "./views");

//ejs setup
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//associations
userModel.hasMany(blogModel, { foreignKey: "author" });
blogModel.belongsTo(userModel, { foreignKey: "author" });
featuredImageModel.hasOne(blogModel, { foreignKey: "featured_id" });
bannerImageModel.hasOne(blogModel, { foreignKey: "banner_id" });
ogImageModel.hasOne(blogModel, { foreignKey: "og_id" });
blogModel.belongsTo(featuredImageModel, { foreignKey: "featured_id" });
blogModel.belongsTo(bannerImageModel, { foreignKey: "banner_id" });
blogModel.belongsTo(ogImageModel, { foreignKey: "og_id" });

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
      where: {
        premium: false,
      },
    });


    res.json({
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalResults: count,
      nextPage: page < Math.ceil(count / limit) ?page + 1:null,
      nextPageUrl: page < Math.ceil(count / limit) ? `https://blogs-23vc.onrender.com/blogs?page=${
        parseInt(page) + 1
      }&limit=${limit}`:null,
      previousePageUrl:
        page > 1
          ? `https://blogs-23vc.onrender.com/blogs?page=${page - 1}&limit=${limit}`
          : null,
      firstPageUrl: `https://blogs-23vc.onrender.com/blogs?page=1&limit=${limit}`,
      lastPageUrl: `https://blogs-23vc.onrender.com/blogs?page=${Math.ceil(
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
