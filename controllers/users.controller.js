const bcrypt = require("bcrypt");

const dbService = require("../services/database.service");

const saltRounds = 10;

const PostgresErrorCodes = {
    UNIQUE_VIOLATION: "23505"
}

exports.createUser = async (req, res, next) => {
    try {
        username = req.body.username;
        pwhash = await bcrypt.hash(req.body.password, saltRounds);

        const user = await dbService.createUser(username, pwhash);

        res.status(201).json({
            message: "User created successfully.",
            "uuid": user.uuid
        });

    } catch (error) {
        switch (error.code) {
            case PostgresErrorCodes.UNIQUE_VIOLATION:
                res.status(409).json({ error: "Username already exists." });
                break;
            default:
                console.log(error);
                res.status(500).json({ error: "Failed to create user." });
        }
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await dbService.deleteUser(req.user.uuid);
        
        if (!user)
            res.status(403).json({ error: "User not found or unauthorized." })

        res.status(204).json({
            message: "User deleted successfully.",
            user
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user." });
    }
}