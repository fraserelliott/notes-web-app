const dbService = require("../services/database.service");

exports.createNote = async (req, res, next) => {
    const uuid = req.user.uuid;
    const title = req.body.title;
    const content = req.body.content;

    try {
        const note = await dbService.createNote(uuid, title, content);
        if (!note)
            return res.status(500).json({ error: "Failed to create note." })
        res.status(201).json({
            message: "Note created successfully.",
            note
         });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to create note." });
    }
};

exports.getNotesForUser = async (req, res, next) => {
    const uuid = req.user.uuid;

    try {
        const notes = await dbService.getNotesForUser(uuid);
        res.status(200).json(notes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to get notes." });
    }
};

exports.updateNote = async (req, res, next) => {
    const uuid = req.user.uuid;
    const noteId = req.params.id;
    const title = req.body.title;
    const content = req.body.content;

    try {
        const note = await dbService.updateNote(uuid, noteId, title, content);
        if (!note)
            return res.status(404).json({ error: "Note not found or not authorized" });
        res.status(200).json({
            message: "Note updated successfully.",
            note
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to update notes." });
    }
};

exports.deleteNote = async (req, res, next) => {
    const uuid = req.user.uuid;
    const noteId = req.params.id;

    try {
        const note = await dbService.deleteNote(uuid, noteId);
        if (!note)
            return res.status(404).json({ error: "Note not found or not authorized" });
        res.status(200).json({ 
            message: "Note deleted successfully.",
            id: note.id
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to delete note." })
    }
};