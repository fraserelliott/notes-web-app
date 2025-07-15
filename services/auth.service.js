const dbService = require("./database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

exports.login = async (username, password) => {
    const user = await dbService.findUserByUsername(username);
    if (!user)
        throw new Error("Incorrect username or password.");

    const match = await bcrypt.compare(password, user.pwhash);

    if (!match)
        throw new Error("Incorrect username or password.");

    const payload = { "uuid": user.uuid }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return { user, token }
};