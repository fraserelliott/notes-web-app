const postgres = require("postgres")
const sql = postgres(process.env.DATABASEURL)

exports.createUser = async (data) => {
    const [user] = await sql`
        INSERT INTO users (username, pwhash)
        VALUES  ('${data.username}', '${data.pwhash}')
        RETURNING uuid, username;
    `;
    return user;
};