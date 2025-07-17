const express = require('express');
const router = express.Router();
const notesController = require("../controllers/notes.controller")

const { FailSchema, StringField } = require('@fraserelliott/fail');
const { validate } = require("../middleware/inputValidation.middleware");
const { validateToken } = require("../middleware/auth.middleware")

noteSchema = new FailSchema();
noteSchema.add("title", new StringField().required().minLength(1));
noteSchema.add("content", new StringField().required().minLength(1));

router.post("/", validateToken(), validate(noteSchema), notesController.createNote);
router.get("/", validateToken(), notesController.getNotesForUser);
router.put("/:id", validateToken(), validate(noteSchema), notesController.updateNote);
router.delete("/:id", validateToken(), notesController.deleteNote);

module.exports = router;