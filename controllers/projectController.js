const Project = require("../models/Project");
const Task = require("../models/Task");

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
    });
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .populate("taskCount")
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("taskCount");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, description },
      { new: true, runValidators: true },
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    await Task.deleteMany({ project: req.params.id });

    res.json({
      success: true,
      message: "Project and its tasks deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
