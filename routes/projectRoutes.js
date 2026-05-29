const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProject, updateProject, deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validateProject } = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateProject, createProject);

router.route('/:id')
  .get(getProject)
  .put(validateProject, updateProject)
  .delete(deleteProject);

module.exports = router;
