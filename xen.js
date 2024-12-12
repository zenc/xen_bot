// 파일 경로 설정
const bot = BotManager.getCurrentBot();

var filePath = "/storage/emulated/0/msgbot/Bots/xen/Botworking.json"; // 경로 변경 가능

// 명령어 목록 초기화 및 파일로부터 불러오기
var learnedCommands = loadLearnedCommands(); // 저장된 명령어를 불러옴

Device.acquireWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, ''); // WakeLock

function saveLearnedCommands() {
    var jsonData = JSON.stringify({ commands: learnedCommands });
    FileStream.write(filePath, jsonData);
}

function loadLearnedCommands() {
    var data = FileStream.read(filePath);
    if (data !== null) {
        try {
            var jsonData = JSON.parse(data);
            return jsonData.commands || []; // 명령어가 없을 때 빈 배열 반환
        } catch (e) {
            return []; // JSON 파싱 오류 시 빈 배열 반환
        }
    }
    return []; // 파일이 없을 경우 빈 배열 반환
}

function teachCommand(command, response, msg) {
    var existingCommand = learnedCommands.find(c => c.work === command);

    let modifiedResponse = response.replace(/^(.*)\(전체보기\)$/m, (line) => {
        return line.replace("(전체보기)", "") + '\u200b'.repeat(500);
    });

    if (existingCommand) {
        existingCommand.talk = modifiedResponse; // 기존 명령어 수정
        msg.reply("✒️ '" + command + "' 명령어의 답변이 수정되었습니다!");
    } else {
        learnedCommands.push({ work: command, talk: modifiedResponse }); // 새 명령어 추가
        msg.reply("'" + command + "' 명령어가 추가되었습니다!");
    }
    saveLearnedCommands(); // 변경사항 저장
}

// 가르친 명령어를 삭제하는 기능
function deleteLearnedCommand(command, msg) {
    var index = learnedCommands.findIndex(c => c.work === command);
    if (index !== -1) {
        learnedCommands.splice(index, 1); // 명령어 삭제
        saveLearnedCommands(); // 변경사항 저장
        msg.reply("❌️ '" + command + "' 명령어가 삭제되었습니다!");
    } else {
        msg.reply("🚫 '" + command + "' 명령어가 존재하지 않습니다.");
    }
}

// 가르친 명령어 목록 보기 기능
function listLearnedCommands(msg) {
    if (learnedCommands.length > 0) {
        let output = "┏⌬ 가르친 명령어 목록\n━━━━━━━━━━━━━━\n\n";
        learnedCommands.forEach((c, i) => {
            output += c.work + (i % 5 === 4 ? "\n" : " / ");
        });
        msg.reply(output.trim());
    } else {
        msg.reply("❌️ 가르친 명령어가 없습니다.");
    }
}

// 가르친 명령어를 실행하는 기능
function executeLearnedCommand(command, msg) {
    var learnedCommand = learnedCommands.find(c => c.work === command);
    if (learnedCommand) {
        msg.reply(learnedCommand.talk);
    }
}

// 응답 처리
function onMessage(msg) {
const room = msg.room;

        /* 가르치기 명령어: !학습 [명령어] [답변] */
        if (msg.content.startsWith("!학습")) {
        var parts = msg.content.split(" ");
        
        // !학습 목록 명령어
        if (msg.content === "!학습 목록") {
            listLearnedCommands(msg);
        }
        // !학습 삭제 [명령어]
        else if (parts[1] === "삭제" && parts.length === 3) {
            var commandToDelete = parts[2]; // 삭제할 명령어
            deleteLearnedCommand(commandToDelete, msg);
        }
        // !학습 [명령어] [답변]
        else if (parts.length >= 3) {
            var command = parts[1]; // 가르칠 명령어
            var response = parts.slice(2).join(" "); // 명령어에 대한 답변
            teachCommand(command, response, msg); // 가르치기 실행
        } else {
            msg.reply("⚙️ 학습 도움말\n\n" + '\u200b'.repeat(500) + "▪︎ !학습 [명령어] [답변]\n▪︎ !학습 삭제 [명령어]\n▪︎ !학습 목록\n\n● 명령어에는 작동되게 하는 단어를, 답변에는 뜨게 하고 싶은 메시지를 작성해주세요.");
        }
    }
    // 가르친 명령어를 실행
    else if (msg.content.startsWith("!")) {
        let command = msg.content.slice(1);
        executeLearnedCommand(command, msg); // 가르친 명령어 실행
    }
}

bot.addListener(Event.MESSAGE, onMessage);