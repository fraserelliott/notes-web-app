const postgres = require("postgres");
const sql = postgres(process.env.DATABASEURL, {
    ssl: "require"
});

exports.createUser = async (username, pwhash) => {
    const [user] = await sql`
        INSERT INTO users (username, pwhash)
        VALUES  (${username}, ${pwhash})
        RETURNING uuid
    `;
    return user;
};

exports.deleteUser = async (uuid) => {
    const [user] = await sql`
        DELETE FROM users
        WHERE uuid=${uuid}
        RETURNING uuid
    `
    return user;
};

exports.findUserByUsername = async (username) => {
    const [user] = await sql`
        SELECT * FROM users
        WHERE username = ${username}
    `;
    return user;
};

exports.createNote = async (uuid, title, content) => {
    const [note] = await sql`
        INSERT INTO notes (user_uuid, title, content)
        VALUES (${uuid}, ${title}, ${content})
        RETURNING
            id,
            user_uuid,
            title,
            content,
            created_at::timestamptz AS created_at,
            updated_at::timestamptz AS updated_at
    `;
    return note;
}

exports.getNotesForUser = async (uuid) => {
    const notes = await sql`
        SELECT
            id,
            user_uuid,
            title,
            content,
            created_at::timestamptz AS created_at,
            updated_at::timestamptz AS updated_at
        FROM notes
        WHERE user_uuid = ${uuid}
        ORDER BY COALESCE(updated_at, created_at) DESC
    `;
    return notes;
}

exports.updateNote = async (uuid, noteId, title, content) => {
    const [note] = await sql`
        UPDATE notes
        SET updated_at=now(), title=${title}, content=${content}
        WHERE id=${noteId} AND user_uuid=${uuid}
        RETURNING
            id,
            user_uuid,
            title,
            content,
            created_at::timestamptz AS created_at,
            updated_at::timestamptz AS updated_at
    `;
    return note;
}

exports.deleteNote = async (uuid, noteId) => {
    const [note] = await sql`
        DELETE FROM notes
        WHERE id=${noteId} AND user_uuid=${uuid}
        RETURNING *
    `;
    return note;
}