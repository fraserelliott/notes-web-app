const express = require("express");
const router = express.Router();

const userRoutes = require("./users.route");
const authRoutes = require("./auth.route")
const noteRoutes = require("./notes.route")

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/notes", noteRoutes);

module.exports = router;