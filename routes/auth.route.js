const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller")

const { FailSchema, StringField } = require('@fraserelliott/fail');
const { validate } = require("../middleware/inputValidation.middleware");

const userSchema = new FailSchema();
userSchema.add("username", new StringField().required());
userSchema.add("password", new StringField().required());

// router.post("/", validate(userSchema), authController.login);

module.exports = router;