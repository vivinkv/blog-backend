require("dotenv").config();
const express = require("express");
const sequelizeConfig = require("./config/sequelize.config");
const app = express();
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//associations
userModel.hasMany(blogModel, { foreignKey: "author" });
blogModel.belongsTo(userModel, { foreignKey: "author" });
blogModel.hasOne(featuredImageModel, { foreignKey: "featured_id" });
blogModel.hasOne(bannerImageModel, { foreignKey: "banner_id" });
blogModel.hasOne(ogImageModel, { foreignKey: "og_id" });

app.get("/", async (req, res) => {
  try {
    const getNonPremiumBlogs = await blogModel.findAll({
      where: {
        premium: false,
      },
      include: [
        {
          model: userModel,
          attributes: ["id", "name", "email", "bio"],
        },
      ],
    });
    res.json({ data: getNonPremiumBlogs });
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
