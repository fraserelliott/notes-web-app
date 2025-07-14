const postgres = require("postgres");
const sql = postgres(process.env.DATABASEURL, {
    ssl: "require"
});

exports.createUser = async (data) => {
    const [user] = await sql`
        INSERT INTO users (username, pwhash)
        VALUES  (${data.username}, ${data.pwhash})
        RETURNING uuid
    `;
    return user;
};

exports.deleteUser = async (uuid) => {
    const affected = await sql`
        DELETE FROM users
        WHERE uuid=${uuid}
        RETURNING id
    `

    return affected.length;
}