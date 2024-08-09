require("dotenv").config();
const express = require("express");
const sequelizeConfig = require("./config/sequelize.config");
const app = express();
const userRoute = require("./routes/user.route");
const blogRoute=require('./routes/blog.route')

const blogModel = require("./models/blog.model");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.get("/", async (req, res) => {
  try {
    const getNonPremiumBlogs = await blogModel.findAll({
      where: {
        premium: false,
      },
    });
    res.json({ data: getNonPremiumBlogs });
  } catch (error) {
    res.json({ err: error });
  }
});

app.use("/user", userRoute);
app.use("/blogs",blogRoute);


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
