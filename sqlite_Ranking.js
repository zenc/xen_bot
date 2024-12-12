const SQLite = require('SQLite');

const sql = new SQLite(); // 전역 데이터베이스 인스턴스 생성

const bot = BotManager.getCurrentBot();

// 봇 초기화 시 데이터베이스 열기

function initializeDatabase() {

    sql.open('/storage/emulated/0/msgbot/Bots/Rankung/user_data.db');

    sql.query(`

        CREATE TABLE IF NOT EXISTS users (

            hash TEXT PRIMARY KEY,

            roomId TEXT,

            chatCount INTEGER DEFAULT 0,

            previousName TEXT,

            currentName TEXT,

            joinDate TEXT

        )

    `);

}

// 데이터베이스를 닫는 함수 (필요한 경우)

function closeDatabase() {

    sql.close();

}

// message 이벤트 처리기

function onMessage(msg) {

    const userHash = msg.author.hash;

    const channelId = msg.channelId; // 방의 ID를 channelId로 수정

    const currentName = msg.author.name;

    let cursor = sql.query(`SELECT * FROM users WHERE hash = '${userHash}' AND roomId = '${channelId}'`);

    if (cursor.getCount() === 0) {

        // 새로운 사용자 추가

        sql.query(`

            INSERT INTO users (hash, roomId, chatCount, previousName, currentName, joinDate) 

            VALUES ('${userHash}', '${channelId}', 0, NULL, '${currentName}', '${new Date().toLocaleDateString()}')

        `);

    } else {

        cursor.moveToFirst();

        const previousName = cursor.getString(cursor.getColumnIndex('currentName'));

        

        // 현재 닉네임이 이전 닉네임과 다른 경우에만 업데이트

        if (previousName !== currentName) {

            sql.query(`

                UPDATE users 

                SET chatCount = chatCount + 1, 

                    previousName = '${previousName}', 

                    currentName = '${currentName}' 

                WHERE hash = '${userHash}' AND roomId = '${channelId}'

            `);

            // 닉네임 변경 감지 응답 메시지

            msg.reply(`[닉네임 변경 감지] ${previousName}님 닉네임이 ${currentName}으로 변경되었습니다`);

        } else {

            // 닉네임이 변경되지 않은 경우 채팅 카운트만 증가

            sql.query(`

                UPDATE users 

                SET chatCount = chatCount + 1 

                WHERE hash = '${userHash}' AND roomId = '${channelId}'

            `);

        }

    }

}

// command 이벤트 처리기

function onCommand(msg) {

    const command = msg.command;

    const args = msg.args;

    const channelId = msg.channelId; // 방의 ID를 channelId로 수정

    if (command === '사용자') {

        const targetName = args[0];


        if (!targetName) {

            msg.reply('올바른 닉네임을 입력하세요. 예: @사용자 [닉네임]');

            return;

        }


        let cursor = sql.query(`SELECT * FROM users WHERE currentName = '${targetName}'`);

        if (cursor.getCount() > 0) {

            cursor.moveToFirst();

            let userInfo = '사용자 닉네임: ' + cursor.getString(cursor.getColumnIndex('currentName')) + '\n' +

                            '이전 닉네임: ' + (cursor.getString(cursor.getColumnIndex('previousName')) || '없음') + '\n' +

                            '수다력: ' + cursor.getInt(cursor.getColumnIndex('chatCount')) + '\n' +

                            '방 입장일: ' + cursor.getString(cursor.getColumnIndex('joinDate'));

            msg.reply(`👤 사용자 정보 👤\n\n${userInfo}`);

        } else {

            msg.reply(`닉네임 "${targetName}"에 해당하는 사용자 정보가 없습니다.`);

        }

    }


    if (command === '수다왕') {

        let cursor = sql.query(`SELECT currentName, chatCount FROM users WHERE roomId = '${channelId}' ORDER BY chatCount DESC LIMIT 10`);

        let leaderboard = [];

        cursor.moveToFirst();

        do {

            leaderboard.push(`${leaderboard.length + 1}위: ${cursor.getString(0)} (수다력: ${cursor.getInt(1)})`);

        } while (cursor.moveToNext());

        msg.reply(`🏆 수다왕 TOP 10 🏆\n\n${leaderboard.join('\n')}`);

    }

}

// 봇 초기화 시 데이터베이스를 열어둠

initializeDatabase();


// 필요한 이벤트 핸들러 추가

bot.addListener(Event.MESSAGE, onMessage);

bot.addListener(Event.COMMAND, onCommand);

bot.setCommandPrefix("."); //@로 시작하는 메시지를 command로 판단