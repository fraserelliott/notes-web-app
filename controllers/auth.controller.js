const authService = require("../services/auth.service");

exports.login = async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const { user, token } = await authService.login(username, password);
        // No need to check these here as the service will throw an error if details are invalid.
        res.status(200).json({
            token,
            "username": user.username,
            "uuid": user.uuid
        });
    } catch (error) {
        return res.status(401).json({ error: "Invalid username or password." })
    }
};