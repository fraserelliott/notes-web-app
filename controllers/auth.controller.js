const authService = require("../services/auth.service");

exports.login = async(req, res, next) => {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    try {
        const { user, token } = await authService.login(username, password);
        res.status(200).json({
            token,
            "username": user.username,
            "uuid": user.uuid
        });
    } catch (error) {
        res.status(401).json({ error: "Invalid username or password." })
    }
};