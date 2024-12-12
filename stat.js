const scriptName = "ChatLoggerBot";
const sqlite3 = require("sqlite3").verbose();

// Database setup
const db = new sqlite3.Database("chat_logs.db", (err) => {
    if (err) console.error("Error opening database:", err.message);
    else console.log("Database connected.");
});

// Create tables for storing logs and statistics
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            room TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            word_count INTEGER,
            emoticon_count INTEGER,
            link_count INTEGER,
            photo_count INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS statistics (
            user TEXT PRIMARY KEY,
            total_lines INTEGER DEFAULT 0,
            total_words INTEGER DEFAULT 0,
            total_emoticons INTEGER DEFAULT 0,
            total_links INTEGER DEFAULT 0,
            total_photos INTEGER DEFAULT 0
        )
    `);
});


const { isLink, isEmoticon, isPhoto } = require("utils"); // Helper functions to detect content type

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // Analyze the message content
    const wordCount = msg.split(/\s+/).length;
    const emoticonCount = (msg.match(/[\u263a-\u27bf\uD83C-\uDBFF\uDC00-\uDFFF]+/g) || []).length;
    const linkCount = isLink(msg) ? 1 : 0;
    const photoCount = imageDB.getImage() ? 1 : 0;

    // Save the log to the database
    db.run(
        `
        INSERT INTO logs (user, room, message, word_count, emoticon_count, link_count, photo_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [sender, room, msg, wordCount, emoticonCount, linkCount, photoCount],
        (err) => {
            if (err) console.error("Error saving log:", err.message);
        }
    );

    // Update user statistics
    db.run(
        `
        INSERT INTO statistics (user, total_lines, total_words, total_emoticons, total_links, total_photos)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user) DO UPDATE SET
            total_lines = total_lines + 1,
            total_words = total_words + ?,
            total_emoticons = total_emoticons + ?,
            total_links = total_links + ?,
            total_photos = total_photos + ?
        `,
        [sender, 1, wordCount, emoticonCount, linkCount, photoCount, wordCount, emoticonCount, linkCount, photoCount]
    );

    // Command to view statistics
    if (msg.startsWith("!stats")) {
        const targetUser = msg.split(" ")[1] || sender; // Default to current user if no target is provided
        db.get(
            `
            SELECT * FROM statistics WHERE user = ?
            `,
            [targetUser],
            (err, row) => {
                if (err) {
                    replier.reply("Error fetching statistics.");
                    console.error(err.message);
                } else if (row) {
                    replier.reply(
                        `${targetUser}'s Statistics:\n` +
                        `- Total Messages: ${row.total_lines}\n` +
                        `- Total Words: ${row.total_words}\n` +
                        `- Total Emoticons: ${row.total_emoticons}\n` +
                        `- Total Links: ${row.total_links}\n` +
                        `- Total Photos: ${row.total_photos}`
                    );
                } else {
                    replier.reply(`${targetUser} has no recorded statistics.`);
                }
            }
        );
    }
}
