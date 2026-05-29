const Task = require("../models/Task");
const Project = require("../models/Project");

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalProjects,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      projectTaskDistribution,
    ] = await Promise.all([
      Project.countDocuments({ owner: userId }),
      Task.countDocuments({ owner: userId }),

      Task.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Task.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),

      Task.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: "$project", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "projects",
            localField: "_id",
            foreignField: "_id",
            as: "project",
          },
        },
        { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
        { $project: { projectTitle: "$project.title", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Format status counts
    const statusMap = { todo: 0, "in-progress": 0, done: 0 };
    tasksByStatus.forEach(({ _id, count }) => {
      if (_id) statusMap[_id] = count;
    });

    // Format priority counts
    const priorityMap = { low: 0, medium: 0, high: 0 };
    tasksByPriority.forEach(({ _id, count }) => {
      if (_id) priorityMap[_id] = count;
    });

    res.json({
      success: true,
      analytics: {
        summary: {
          totalProjects,
          totalTasks,
          completedTasks: statusMap["done"],
          pendingTasks: statusMap["todo"] + statusMap["in-progress"],
        },
        tasksByStatus: [
          { name: "Todo", value: statusMap["todo"], color: "#6366f1" },
          {
            name: "In Progress",
            value: statusMap["in-progress"],
            color: "#f59e0b",
          },
          { name: "Done", value: statusMap["done"], color: "#10b981" },
        ],
        tasksByPriority: [
          { name: "Low", value: priorityMap["low"], color: "#10b981" },
          { name: "Medium", value: priorityMap["medium"], color: "#f59e0b" },
          { name: "High", value: priorityMap["high"], color: "#ef4444" },
        ],
        projectTaskDistribution: projectTaskDistribution.map((p) => ({
          name: p.projectTitle || "Unknown",
          tasks: p.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
