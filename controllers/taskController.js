const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    const projectDoc = await Project.findOne({
      _id: project,
      owner: req.user._id,
    });
    if (!projectDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      owner: req.user._id,
    });

    const populated = await task.populate("project", "title");
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, project, search } = req.query;

    const query = { owner: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
      pagination: {
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("project", "title");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    if (project) {
      const projectDoc = await Project.findOne({
        _id: project,
        owner: req.user._id,
      });
      if (!projectDoc) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, description, status, priority, dueDate, project },
      { new: true, runValidators: true },
    ).populate("project", "title");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
