const axios = require("axios");
const blogModel = require("../models/blog.model");
const userModel = require("../models/user.model");
const bannerImageModel = require("../models/bannerImage.model");
const { v4: uuidv4 } = require("uuid");
const blogCommentModel = require("../models/blogComment.model");
const pageModel = require("../models/page/page.model");
const blogCategoryModel = require("../models/blogCategory.model");
// const readExcelFile = require("../utils/readExcelFile");
const path = require("path");
const categoryData = require("../utils/data");
const readExcelFile = require("../utils/readExcelFile");
const slugify = require("slugify");

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

// addComments();

const deleteRow = async () => {
  const findRows = await userModel.findAll({
    where: {
      name: "",
    },
  });

  for (const row of findRows) {
    await row.destroy();
  }
  console.log(findRows);
};

// deleteRow()

const deleteTableData = async () => {
  await blogCommentModel.destroy({ truncate: true });
  await blogModel.destroy({ truncate: true });
  await bannerImageModel.destroy({ truncate: true });
};
// deleteTableData();

const updatePageData = async () => {
  try {
    const pages = await pageModel.findAll({});

    for (const page of pages) {
      await pageModel.update(
        {
          page_name: page.dataValues.title,
        },
        {
          where: {
            id: page.dataValues.id,
          },
        }
      );
    }
  } catch (error) {
    console.log({ err: error.message });
  }
};

// updatePageData();

const addCategory = async () => {
  const categoryList = await readExcelFile("utils/THH.xlsx");
  console.log(categoryList);
  for (const category of categoryList) {
    const findCategory = await blogCategoryModel.findByPk(
      category.Id.toString()
    );
    console.log(category.Description);
    if (!findCategory) {
      await blogCategoryModel.create({
        id: category.Id.toString(),
        name: category.CategoryName,
        title: category.PageTitle,
        description:
          category.Description == undefined
            ? category.PageTitle
            : category.Description,
        status: category.Status,
        slug: category.Slub,
        meta_title: category.MetaTitle,
        meta_description: category.Description,
      });
    }
  }

  // for(const category of categoryData.ResourceCategories){
  //   await blogCategoryModel.create({
  //     id:category.Id.toString(),
  //     name:category.CategoryName,
  //     title:category.PageTitle,
  //     description:category.Description?.length==0 ? category.PageTitle : category.Description,
  //     status:category.Status,
  //     slug:category.Slub,
  //     meta_title:category.MetaTitle,
  //     meta_description:category.Description
  //   });
  // }
};
// addCategory();

const addSlugs = async () => {
  const blogs = await blogModel.findAll({
    where: {
      slug: null,
    },
  });

  for (const blog of blogs) {
    await blogModel.update(
      {
        slug: slugify(blog.dataValues.title, {
          replacement: "-",
          remove: undefined,
          lower: true,
          strict: false,
          trim: true,
        }),
      },
      {
        where: {
          id: blog.dataValues.id,
        },
      }
    );
  }

  console.log("Slug Added Successfully");
};
// addSlugs();

const addBlogs = async () => {
  const blogs = await readExcelFile("utils/blog.xlsx");
  let not_working = [];
  let working = [];
  for (let i = 2; i < blogs.length; i++) {
    const id = blogs[i].__EMPTY_1.split("/").pop().split("-")[0];

    const findBlog = await blogModel.findByPk(id);
    if (!findBlog) {
      const blogDetails = await axios.get(
        `http://www.thehappyhomes.com/getresources.aspx?MaxCount=1&StartId=${id}`
      );

      if (Array.isArray(blogDetails?.data)) {
        console.log("working");
        console.log(blogDetails.data?.length);
       
         
            // console.log(i);
            // console.log(typeof blog.ID.toString());
            console.log(blogDetails.data[0].Member.ID);
            console.log(blogDetails.data[0].ID);
            let user = await userModel.findOne({
              where: {
                email: blogDetails.data[0].Member.Email,
              },
            });

            if (!user) {
              user = await userModel.create({
                id: blogDetails.data[0].Member.ID.toString(),
                name: blogDetails.data[0].Member.Name,
                email: blogDetails.data[0].Member.Email,
                password: blogDetails.data[0].Member.Passcrypt,
                user_id: blogDetails.data[0].Member.UserID,
              });
            }

            const findBlog = await blogModel.findByPk(blogDetails.data[0].ID.toString());
            if (!findBlog) {
              const newBlog = await blogModel.create({
                id: blogDetails.data[0].ID.toString(),
                title: blogDetails.data[0].Title,
                meta_title: blogDetails.data[0].MetaTitle,
                short_description: blogDetails.data[0].MetaDescription,
                meta_description: blogDetails.data[0].MetaDescription,
                description: blogDetails.data[0].Description,
                author: user.dataValues.id,
                publish_date: blogDetails.data[0].PostedDate,
                is_published: blogDetails.data[0].PublishStatus,
              });

              for (attachment of blogDetails.data[0].Attachments) {
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

            for (const comment of blogDetails.data[0].Responses) {
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

              const findComment = await blogCommentModel.findOne({
                where: {
                  comment: comment.Description,
                  blog_id: comment.ResourceId.toString(),
                },
              });

              if (!findComment) {
                const createComment = await blogCommentModel.create({
                  comment: comment.Description,
                  user_id: user.dataValues.id,
                  blog_id: comment.ResourceId,
                  createdAt: comment.PostedDate,
                  status: comment.Status,
                });
              }
            }
          
        
      } else {
        not_working.push(id);
      }
    }
  }
  console.log("Data Stored Successfully");
};

addBlogs();
