const sqlite3 = require('sqlite3').verbose();
const moment = require('moment'); // For date and time handling
const bot = BotManager.getCurrentBot();

// Initialize SQLite3 database
const db = new sqlite3.Database('facts.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS facts (
            key TEXT PRIMARY KEY,
            value TEXT,
            type TEXT DEFAULT 'normal' -- 'normal', 'reply', 'action'
        )`);
    }
});

// \ 연산자 에러방지 처리
function escapeBackwacking(content) {
    return content.replace(/\\(.)/g, '$1');
}

// 시간과 사용자 변수 교체
function replaceVariables(value, who) {
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    return value.replace(/\$who/g, who).replace(/\$date/g, date);
}

// 랜덤 응답을 위한 | 구분 옵션 포함
function getRandomResponse(value) {
    const options = value.split('|');
    return options[Math.floor(Math.random() * options.length)];
}

// 입력 및 업데이트

function addFact(key, value, type, callback) {
    db.run(
        `INSERT OR REPLACE INTO facts (key, value, type) VALUES (?, ?, ?)`,
        [key, value, type],
        function (err) {
            if (err) {
                callback(`Error saving fact: ${err.message}`);
            } else {
                callback(`Fact '${key}' saved successfully!`);
            }
        }
    );
}

// 응답 처리
function getFact(key, callback) {
    db.get(`SELECT value, type FROM facts WHERE key = ?`, [key], (err, row) => {
        if (err) {
            callback(`Error retrieving fact: ${err.message}`);
        } else if (row) {
            callback(null, row.value, row.type);
        } else {
            callback(`No fact found for '${key}'.`);
        }
    });
}

// 응답 삭제
function forgetFact(key, callback) {
    db.run(`DELETE FROM facts WHERE key = ?`, [key], function (err) {
        if (err) {
            callback(`Error deleting fact: ${err.message}`);
        } else if (this.changes > 0) {
            callback(`Fact '${key}' has been forgotten.`);
        } else {
            callback(`No fact found for '${key}'.`);
        }
    });
}

// 메시지 처리
function onMessage(msg) {
    const content = escapeBackwacking(msg.content.trim());
    const who = msg.author.name;

    // Retrieve a fact
    if (content.startsWith('get:')) {
        const key = content.slice(4).trim();
        getFact(key, (err, value, type) => {
            if (err) {
                msg.reply(err);
            } else {
                let response = type === 'normal' ? getRandomResponse(value) : value;
                if (type === 'action') response = `/me ${response}`;
                msg.reply(replaceVariables(response, who));
            }
        });
    }
    // Add a fact
    else if (content.startsWith('add:')) {
        const parts = content.slice(4).split('=');
        if (parts.length === 2) {
            const [key, typeSpecifier] = parts[0].trim().split(':');
            const value = parts[1].trim();
            const type = typeSpecifier === '<reply>' ? 'reply' : typeSpecifier === '<action>' ? 'action' : 'normal';
            addFact(key, value, type, (response) => msg.reply(response));
        } else {
            msg.reply("Invalid format. Use 'add:<key>=<value>' or 'add:<key>:<type>=<value>' to add a fact.");
        }
    }
    // Forget a fact
    else if (content.startsWith('forget:')) {
        const key = content.slice(7).trim();
        forgetFact(key, (response) => msg.reply(response));
    }
    // Modify a fact with substitution
    else if (content.match(/^(\w+)\s+=~\s+s\/(.*?)\/(.*?)\/$/)) {
        const [, key, oldValue, newValue] = content.match(/^(\w+)\s+=~\s+s\/(.*?)\/(.*?)\/$/);
        getFact(key, (err, value, type) => {
            if (err) {
                msg.reply(err);
            } else {
                const updatedValue = value.replace(oldValue, newValue);
                addFact(key, updatedValue, type, (response) => msg.reply(response));
            }
        });
    }
    // Default response for unknown commands
    else {
        msg.reply("Unknown command. Please use 'add', 'get', or 'forget'.");
    }
}

