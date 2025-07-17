const express = require('express');
const router = express.Router();
const usersController = require("../controllers/users.controller")

const { FailSchema, StringField } = require('@fraserelliott/fail');
const { validate } = require("../middleware/inputValidation.middleware");
const { validateToken } = require("../middleware/auth.middleware")

// Define validation rules for user registration inputs
const userSchema = new FailSchema();
userSchema.add("username", new StringField().required().minLength(8).maxLength(20).alphanumeric());
userSchema.add("password", new StringField().required().minLength(8).maxLength(20));

router.post("/", validate(userSchema), usersController.createUser);
router.delete("/", validateToken, usersController.deleteUser);

module.exports = router;