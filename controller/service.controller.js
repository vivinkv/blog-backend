const serviceModel = require("../models/service/service.model");
const userModel = require("../models/user.model");
const serviceSectionModel = require("../models/service/section.model");
require("dotenv").config();

//get all services
const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userModel,
          as: "service_created_by",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    console.log(services);

    res.render("service/index", {
      title: "Service List",
      data: services,
      query: {},
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//get specific blog details
const getServiceDetail = async (req, res) => {
  const { id } = req.params;
  console.log(req.query);
  try {
    const service = await serviceModel.findByPk(id, {
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as: "service_created_by",
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: serviceSectionModel,
          foreignKey: "service_id",
          as: "service_sections",
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ err: "service notfound" });
    }
    res.json({
      data: service.dataValues,
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

//creat new service

const createService = async (req, res) => {
  const {
    service_name,
    title,
    is_published,
    premium,
    short_description,
    top_description,
    bottom_description,
    sections,
  } = req.body;
  console.log("start");
  console.log(sections);
  console.log(req.body);
  console.log("end");

  // Parse the sections from the request body
  // const sections = JSON.parse(sections);

  try {
    // Validate the title length
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }

    // Create the blog entry in the serviceModel
    const createService = await serviceModel.create({
      service_name:service_name,
      title: title,
      description: top_description,
      is_published: is_published,
      premium: premium,
      short_description: short_description,
      top_description: top_description,
      bottom_description: bottom_description,
      author: req.user.id,
      // No need to add banner_id since we are not handling the banner image
    });

    // Create the sections related to the blog
    for (const section of sections) {
      try {
        const sectionData = await serviceSectionModel.create({
          service_id: createService.dataValues.id,
          heading: section?.heading,
          content: section?.content,
          section_name: section?.heading,
        });
        console.log(sectionData);
      } catch (error) {
        return res.status(500).json({ err: error.message });
      }
    }

    // Respond with the created blog data
    res
      .status(200)
      .json({ data: createService.dataValues, msg: "Created Successfully" });
  } catch (error) {
    // Handle errors that occur during the blog creation process
    res.status(500).json({ err: error.message });
  }
};

const getUpdateService = async (req, res) => {
  const { id } = req.params;

  if (req?.query?.publish) {
    console.log("yes");
    const updateBlog = await serviceModel.update(
      {
        is_published: req?.query?.publish == "true" ? false : true,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.redirect("/admin/services");
    return;
  }
  if (req?.query?.premium) {
    console.log("yes");
    const updateBlog = await serviceModel.update(
      {
        premium: req?.query?.premium == "true" ? false : true,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.redirect("/admin/services");
    return;
  }

  const findService = await serviceModel.findByPk(id, {
    include: [
      {
        model: serviceSectionModel,
        foreignKey: "service_id",
        as: "service_sections",
      },
      {
        model: userModel,
        foreignKey: "author",
        as: "service_created_by",
        attributes: {
          exclude: ["password"],
        },
      },
    ],
  });

  if (!findService) {
    return res.status(404).json({ err: "Service not-found" });
  }
  console.log(findService.dataValues);
  res.render("service/update", {
    data: findService.dataValues,
    title: "Update Service",
  });
};

//update existing blog
const updateService = async (req, res) => {
  const {
    service_name,
    title,
    premium,
    short_description,
    is_published,
    top_description,
    bottom_description,
    sections,
  } = req.body;

  const { id } = req.params;

  try {
    if (title?.length > 100 || title?.length < 10) {
      return res.status(400).json({
        type: "title",
        err: "Title must be between 10 and 100 characters",
      });
    }

    // Load the existing blog and its sections
    const service = await serviceModel.findByPk(id, {
      include: [
        {
          model: serviceSectionModel,
          foreignKey: "service_id",
          as: "service_sections",
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ err: "service not found" });
    }

    const existingSections = service.service_sections;

    // Track sections to delete and those already processed
    const sectionsToDelete = [...existingSections];
    const processedSectionIds = [];

    // Iterate over incoming sections to create or update
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Find a matching section in the existing sections by heading or some unique property
      const existingSection = existingSections.find(
        (existing) =>
          existing.heading === section.heading &&
          !processedSectionIds.includes(existing.id)
      );

      if (existingSection) {
        // Update existing section
        await serviceSectionModel.update(
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
        await serviceSectionModel.create({
          service_id: id,
          heading: section.heading,
          content: section.content,
          section_name: section.heading,
        });
      }
    }

    // Delete sections that were not processed (i.e., they are not in the incoming data)
    for (const section of sectionsToDelete) {
      await serviceSectionModel.destroy({
        where: {
          id: section.id,
        },
      });
    }

    // Update the service details without changing the banner
    const updateService = await serviceModel.update(
      {
        service_name,
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
    res.status(200).json({ data: updateService, msg: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Delete existing service
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const findService = await serviceModel.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: userModel,
          foreignKey: "author",
          as: "service_created_by",
          attributes: {
            exclude: ["password"],
          },
        },
        {
          model: serviceSectionModel,
          foreignKey: "service_id",
          as: "service_sections",
        },
      ],
    });
    if (!findService) {
      return res.status(404).json({ err: "Service notfound" });
    }
    const findServiceSection = await serviceSectionModel.findAll({
      where: {
        service_id: findService.dataValues.id,
      },
    });

    await findService.destroy();
    findServiceSection?.map(async (serviceSection) => {
      await serviceSection.destroy();
    });
    res.redirect("/admin/services");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const duplicateService = async (req, res) => {
  const { id } = req.params;

  try {
    const findService = await serviceModel.findByPk(id, {
      include: [
        {
          model: serviceSectionModel,
          foreignKey: "service_id",
          as: "service_sections",
        },
      ],
    });

    if (findService) {
      // Create the duplicate blog
      const createDuplicateService = await serviceModel.create({
        title: req?.query?.title,
        short_description: findService.dataValues.short_description,
        description: findService.dataValues.description,
        is_published: findService.dataValues.is_published,
        top_description: findService?.dataValues?.top_description,
        bottom_description: findService?.dataValues?.bottom_description,
        publish_date: findService.dataValues.publish_date,
        premium: findService.dataValues.premium,
        meta_title: findService.dataValues.meta_title,
        meta_description: findService.dataValues.meta_description,
        banner_id: findService.dataValues.banner_id,
        featured_id: findService.dataValues.featured_id,
        og_id: findService.dataValues.og_id,
        author: findService.dataValues.author,
        role: findService.dataValues.role,
      });

      // Duplicate sections
      if (
        findService.service_section &&
        findService.service_section.length > 0
      ) {
        const sectionPromises = findService.service_section.map((section) =>
          blogSectionModel.create({
            blog_id: createDuplicateService.id,
            heading: section.heading,
            content: section.content,
            section_name: section.heading,
          })
        );
        await Promise.all(sectionPromises);
      }

      res.redirect("/admin/services");
    } else {
      res.status(404).json({ err: "Blog not found" });
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  getAllServices,
  getServiceDetail,
  createService,
  getUpdateService,
  updateService,
  deleteService,
  duplicateService,
};
