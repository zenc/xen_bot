const bot = BotManager.getCurrentBot();
var filePath = "/storage/emulated/0/msgbot/Bots/newxen/Botworking.json"; // 경로 변경 가능
Device.acquireWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, ''); // WakeLock

// 명령어 목록 초기화 및 파일로부터 불러오기
function loadLearnedCommands(room) {
    var data = FileStream.read(filePath);
    var roomData = {}; // Room 별 데이터를 저장하기 위한 객체
    if (data !== null) {
        try {
            var jsonData = JSON.parse(data);
            roomData = jsonData[room] || []; // 해당 room에 대한 명령어들
        } catch (e) {
            roomData = []; // JSON 파싱 오류 시 빈 배열 반환
        }
    }
    return roomData; // 해당 방의 명령어 배열 반환
}

function saveLearnedCommands(room, learnedCommands) {
    var data = FileStream.read(filePath);
    var allData = {}; // 전체 데이터
    if (data !== null) {
        try {
            allData = JSON.parse(data); // 기존 데이터를 읽어옴
        } catch (e) {
            allData = {}; // JSON 파싱 오류 시 빈 객체 반환
        }
    }
    allData[room] = learnedCommands; // 해당 room에 명령어 목록 저장
    var jsonData = JSON.stringify(allData);
    FileStream.write(filePath, jsonData); // 파일에 저장
}

// 명령어를 가르치는 기능
function teachCommand(room, command, response, msg) {
    var learnedCommands = loadLearnedCommands(room);
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
    saveLearnedCommands(room, learnedCommands); // 변경사항 저장
}

// 명령어에 추가적인 답변을 추가하는 기능
function addAdditionalAnswer(room, command, newAnswer, msg) {
    var learnedCommands = loadLearnedCommands(room);
    var existingCommand = learnedCommands.find(c => c.work === command);

    if (existingCommand) {
        // 기존 답변에 새로운 답변 추가
        existingCommand.talk += `|${newAnswer}`;
        saveLearnedCommands(room, learnedCommands);
        msg.reply("➕ '" + command + "' 명령어에 새로운 답변이 추가되었습니다!");
    } else {
        msg.reply("🚫 '" + command + "' 명령어가 존재하지 않습니다. 먼저 명령어를 학습시켜 주세요.");
    }
}

// 가르친 명령어를 삭제하는 기능
function deleteLearnedCommand(room, command, msg) {
    var learnedCommands = loadLearnedCommands(room);
    var index = learnedCommands.findIndex(c => c.work === command);

    if (index !== -1) {
        learnedCommands.splice(index, 1); // 명령어 삭제
        saveLearnedCommands(room, learnedCommands); // 변경사항 저장
        msg.reply("❌️ '" + command + "' 명령어가 삭제되었습니다!");
    } else {
        msg.reply("🚫 '" + command + "' 명령어가 존재하지 않습니다.");
    }
}

// 가르친 명령어 목록 보기 기능
function listLearnedCommands(room, msg) {
    var learnedCommands = loadLearnedCommands(room);

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

// 랜덤 응답 선택 함수
function getRandomResponse(response) {
    const options = response.split('|'); // |로 구분된 항목
    return options[Math.floor(Math.random() * options.length)];
}

// 가르친 명령어를 실행하는 기능
function executeLearnedCommand(room, command, msg) {
    var learnedCommands = loadLearnedCommands(room);
    var learnedCommand = learnedCommands.find(c => c.work === command);

    if (learnedCommand) {
        var randomResponse = getRandomResponse(learnedCommand.talk);
        randomResponse = randomResponse.replace(/\$누구/g, msg.author.name.substring(0, 2));
        msg.reply(randomResponse);
    }
}

// 응답 처리
function onMessage(msg) {
    const room = msg.room;

    if (msg.content.startsWith("!젠아")) {
        var parts = msg.content.split(" ");

        // !학습 목록
        if (msg.content === "!젠아 목록") {
            listLearnedCommands(room, msg);
        }
        // !학습 삭제 [명령어]
        else if (parts[1] === "삭제" && parts.length === 3) {
            var commandToDelete = parts[2]; // 삭제할 명령어
            deleteLearnedCommand(room, commandToDelete, msg);
        }
        // !학습 추가 [명령어] [새 답변]
        else if (parts[1] === "추가" && parts.length >= 4) {
            var commandToAddTo = parts[2];
            var newAnswer = parts.slice(3).join(" ");
            addAdditionalAnswer(room, commandToAddTo, newAnswer, msg);
        }
        // !학습 [명령어] [답변]
        else if (parts.length >= 3) {
            var command = parts[1]; // 가르칠 명령어
            var response = parts.slice(2).join(" "); // 명령어에 대한 답변
            teachCommand(room, command, response, msg); // 가르치기 실행
        } else {
            msg.reply("⚙️ 젠아 도움말\n\n" + '\u200b'.repeat(500) + "▪︎ !젠아 [명령어] [답변]\n▪︎ !젠아 삭제 [명령어]\n▪︎ !젠아 추가 [명령어] [새 답변]\n▪︎ !젠아 목록\n\n● 명령어에는 작동되게 하는 단어를, 답변에는 뜨게 하고 싶은 메시지를 작성해주세요.");
        }
    }
    // 가르친 명령어를 실행
    else if (msg.content.startsWith("")) {
        let command = msg.content.slice(0);
        executeLearnedCommand(room, command, msg); // 가르친 명령어 실행
    }
}

bot.addListener(Event.MESSAGE, onMessage);