const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateProject = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2-100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Project description is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be 5-500 characters"),
  handleValidationErrors,
];

const validateTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2-100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Task description is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be 5-1000 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid date format"),
  body("project")
    .notEmpty()
    .withMessage("Project is required")
    .isMongoId()
    .withMessage("Invalid project ID"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateTask,
};
