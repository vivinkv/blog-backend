const jobModel = require("../models/career/job.model");

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobModel.findAll({});
    console.log(jobs);
    res.render("career/index", {title:'Career', data: jobs,query:{} });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const createJob = async (req, res) => {
  const {
    title,
    description,
    responsibilities,
    requirements,
    last_date,
    benefits,
  } = req.body;

  console.log(req.body);

  try {
    if (title?.length < 10 || title?.length > 50) {
      return res
        .status(400)
        .json({ err: "Title must be between 10 and 50 characters" });
    }
    const addJob = await jobModel.create({
      title:title,
      description:description,
      responsibilities:responsibilities,
      requirements:requirements,
      last_date:last_date,
      benefits:benefits,
    });
    res.status(201).json({ msg: "Created Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getUpdateJob = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const findJob = await jobModel.findByPk(id);
    if (!findJob) {
      return res.status(404).json({ err: "Job not-found" });
    }
    res.render("career/update", { title:'Update Job', data: findJob.dataValues });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const updateJob = async (req, res) => {
  const { id } = req.params;
  console.log('update');
  try {
    const findJob = await jobModel.findByPk(id);
    if (!findJob) {
      return res.status(404).json({ err: "Job not-found" });
    }
    const update = await jobModel.update(req.body, {
      where: {
        id: id,
      },
    });

    res.status(200).json({ msg: "Updated Successfully" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const findJob = await jobModel.findByPk(id);
    if (!findJob) {
      return res.status(404).json({ err: "Job not-found" });
    }
    const removeJob = await findJob.destroy();
    res.redirect("/admin/career");
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = { getAllJobs, createJob, getUpdateJob, updateJob, deleteJob };
