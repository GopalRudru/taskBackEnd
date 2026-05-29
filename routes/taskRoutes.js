const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { validateTask } = require("../middleware/validationMiddleware");

router.use(protect);

router.route("/").get(getTasks).post(validateTask, createTask);

router
  .route("/:id")
  .get(getTask)
  .put(validateTask, updateTask)
  .delete(deleteTask);

module.exports = router;
