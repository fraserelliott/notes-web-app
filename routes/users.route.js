const express = require('express');
const router = express.Router();
const usersController = require("../controllers/users.controller")

const { FailSchema, StringField } = require('@fraserelliott/fail');
const { validate } = require("../middleware/inputValidation.middleware");

const userSchema = new FailSchema();
userSchema.add("username", new StringField().required().minLength(8));
userSchema.add("password", new StringField().required().minLength(8));

router.post("/", validate(userSchema), usersController.createUser);

module.exports = router;