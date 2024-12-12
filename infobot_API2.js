const sqlite3 = require('SQLite').verbose();
const moment = require('moment'); // For date and time handling
const bot = BotManager.getCurrentBot();

// Initialize SQLite3 database
const db = new sqlite3.Database('facts.db', (err) => {
    if (err) {
        console.error('DB 연결에 실패했습니다:', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS facts (
            room TEXT,
            key TEXT,
            value TEXT,
            type TEXT DEFAULT 'normal', -- 'normal', 'reply', 'action'
            PRIMARY KEY (room, key)
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

function addFact(room, key, value, type, callback) {
    db.run(
        `INSERT OR REPLACE INTO facts (room, key, value, type) VALUES (?, ?, ?, ?)`,
        [room, key, value, type],
        function (err) {
            if (err) {
                callback(`Error saving fact: ${err.message}`);
            } else {
                callback(`Fact '${key}' saved successfully for room '${room}'!`);
            }
        }
    );
}

// 응답 처리
function getFact(room, key, callback) {
    db.get(
        `SELECT value, type FROM facts WHERE room = ? AND key = ?`,
        [room, key],
        (err, row) => {
            if (err) {
                callback(`Error retrieving fact: ${err.message}`);
            } else if (row) {
                callback(null, row.value, row.type);
            } else {
                callback(`No fact found for '${key}' in room '${room}'.`);
            }
        }
    );
}

// 응답 삭제
function forgetFact(room, key, callback) {
    db.run(
        `DELETE FROM facts WHERE room = ? AND key = ?`,
        [room, key],
        function (err) {
            if (err) {
                callback(`Error deleting fact: ${err.message}`);
            } else if (this.changes > 0) {
                callback(`Fact '${key}' has been forgotten in room '${room}'.`);
            } else {
                callback(`No fact found for '${key}' in room '${room}'.`);
            }
        }
    );
}

// 메시지 처리
function onMessage(msg) {
    const room = msg.room; // 메시지를 받은 방 이름
    const content = escapeBackwacking(msg.content.trim());
    const who = msg.author.name.substr(0, 2); // 메시지 전송자 이름 앞글자 2자만

    // Retrieve a fact
    if (content.startsWith('get:')) {
        const key = content.slice(4).trim();
        getFact(room, key, (err, value, type) => {
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
            addFact(room, key, value, type, (response) => msg.reply(response));
        } else {
            msg.reply("Invalid format. Use 'add:<key>=<value>' or 'add:<key>:<type>=<value>' to add a fact.");
        }
    }
    // Forget a fact
    else if (content.startsWith('forget:')) {
        const key = content.slice(7).trim();
        forgetFact(room, key, (response) => msg.reply(response));
    }
    // Modify a fact with substitution
    else if (content.match(/^(\w+)\s+=~\s+s\/(.*?)\/(.*?)\/$/)) {
        const [, key, oldValue, newValue] = content.match(/^(\w+)\s+=~\s+s\/(.*?)\/(.*?)\/$/);
        getFact(room, key, (err, value, type) => {
            if (err) {
                msg.reply(err);
            } else {
                const updatedValue = value.replace(oldValue, newValue);
                addFact(room, key, updatedValue, type, (response) => msg.reply(response));
            }
        });
    }
    // Default response for unknown commands
    else {
        msg.reply("Unknown command. Please use 'add', 'get', or 'forget'.");
    }
}
