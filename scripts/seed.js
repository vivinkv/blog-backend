const axios = require("axios");
const blogModel = require("../models/blog.model");
const userModel = require("../models/user.model");
const bannerImageModel = require("../models/bannerImage.model");
const { v4: uuidv4 } = require("uuid");
const blogCommentModel = require("../models/blogComment.model");

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
          user_id: blog.Member.UserID,
        });
        console.log(user);
      }
      const findBlog = await blogModel.findOne({
        where: {
          id: blog.ID,
        },
      });
      if (!findBlog) {
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
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// fetchData();

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

const fetchApi = async () => {
  const data = await axios.get(
    "http://www.thehappyhomes.com/getresources.aspx"
  );
  console.log(data.data[0]);
};

// fetchApi()

const addNewBlogs = async () => {
  try {
    // for (let i = 100; i <= 104; i++) {
    const blogs = await axios.get(
      `http://www.thehappyhomes.com/getresources.aspx?MaxCount=103&StartId=100`
    );

    for (const blog of blogs.data) {
      // console.log(i);
      console.log(typeof blog.ID.toString());
      console.log(blog.Member.ID);
      console.log(blog.ID);
      let user = await userModel.findOne({
        where: {
          email: blog.Member.Email,
        },
      });

      if (!user) {
        user = await userModel.create({
          id: blog.Member.ID.toString(),
          name: blog.Member.Name,
          email: blog.Member.Email,
          password: blog.Member.Passcrypt,
          user_id: blog.Member.UserID,
        });
      }

      const findBlog = await blogModel.findByPk(blog.ID.toString());
      if (!findBlog) {
        const newBlog = await blogModel.create({
          id: blog.ID.toString(),
          title: blog.Title,
          meta_title: blog.MetaTitle,
          short_description: blog.MetaDescription,
          meta_description: blog.MetaDescription,
          description: blog.Description,
          author: user.dataValues.id,
          publish_date: blog.PostedDate,
          is_published: blog.PublishStatus,
        });

        for (attachment of blog.Attachments) {
          await bannerImageModel.create({
            blog_id: newBlog.dataValues.id,
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
    }
    // }
  } catch (error) {
    console.log(error.message);
  }
};

// addNewBlogs();

const addComments = async () => {
  try {
    const blogs = await axios.get(
      `http://www.thehappyhomes.com/getresources.aspx?MaxCount=103&StartId=100`
    );

    for (const blog of blogs.data) {
      for (const comment of blog.Responses) {
        let user = await userModel.findOne({
          where: {
            email: comment.Email,
          },
        });

        if (!user) {
          user = await userModel.create({
            email: comment.Email,
            password: uuidv4(),
            name: comment.AuthorName,
            user_id: comment.Email,
          });
        } else {
          await userModel.update(
            {
              user_id: comment.Email,
            },
            {
              where: {
                id: user.dataValues.id,
              },
            }
          );
        }

        // const findComment = await blogCommentModel.findOne({
        //   where: {
        //     comment: comment.Description,
        //     blog_id: comment.ResourceId.toString(),
        //   },
        // });

        // if (!findComment) {
        //   const createComment = await blogCommentModel.create({
        //     comment: comment.Description,
        //     user_id: user.dataValues.id,
        //     blog_id: comment.ResourceId,
        //     createdAt: comment.PostedDate,
        //     status: comment.Status,
        //   });
        // }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

addComments();
