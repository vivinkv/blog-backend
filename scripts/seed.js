const axios = require("axios");
const blogModel = require("../models/blog.model");
const userModel = require("../models/user.model");
const bannerImageModel = require("../models/bannerImage.model");

async function fetchData() {
  try {
    const response = await axios.get(
      "http://www.thehappyhomes.com/getresources.aspx"
    );
    const data = response.data;

    console.log("Fetched Data:", data);

    // Add logic to process or save the data to your database

    for (blog of data) {
      let user;
      user = await userModel.findOne({
        where: {
          email: blog.Member.Email,
        },
      });
      if (!user) {
        user = await userModel.create({
          id: blog.Member.ID,
          name: blog.Member.Name,
          email: blog.Member.Email,
          password: blog.Member.Passcrypt,
          user_id:blog.Member.UserID
        });
        console.log(user);
      }
      await blogModel.create({
        id: blog.ID,
        title: blog.Title || "null",
        description: blog.Description || "null",
        short_description: blog.MetaDescription || "null",
        is_published: blog.PublishStatus,
        publish_date: blog.PostedDate,
        meta_title: blog.MetaTitle,
        meta_description: blog.MetaDescription || "null",
        author: user.dataValues.id,
      });

      for (attachment of blog.Attachments) {
        await bannerImageModel.create({
          resource_id: attachment.ResourceId,
          fieldname: attachment.FileType,
          originalname: attachment.Filename,
          encoding: attachment.PostedMemberId,
          mimetype: attachment.PostedMemberId,
          destination: attachment.Filename,
          filename: attachment.Filename,
          path: attachment.Filename,
          size: attachment.ResourceId,
          image_type: "attachment",
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();

const showUser = async () => {
  const users = await userModel.findAll({});
  console.log(users);
};

//showUser();

const showBlogs = async () => {
  const data = await blogModel.findAll({});
  console.log("blog data : ", data);
};

// showBlogs();

//show api data

const fetchApi=async()=>{
    const data=await axios.get('http://www.thehappyhomes.com/getresources.aspx');
    console.log(data.data[0]);
}

// fetchApi()