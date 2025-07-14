const jwt = require("jsonwebtoken");

function validateToken() {
    return (req, res, next) => {
        if (!req.headers["Authorization"])
            return _invalidToken(res);

        const auth = req.headers["authorization"].split(" ");

        if (auth[0] !== "Bearer")
            return _invalidToken(res);

        try {
            const decoded = jwt.verify(auth[1], process.env.JWT_SECRET);

            req.user = decoded;

            next();
        } catch (err) {
            return _invalidToken(res);
        }
    }
}

function _invalidToken(res) {
    return res.status(401).json({
        error: "Action requires authentication."
    });
}

module.exports = { validateToken }