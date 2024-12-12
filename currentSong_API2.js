const bot = BotManager.getCurrentBot();
const { Jsoup } = org.jsoup;

// 헌재 재생중의 곡명을 출력하는 기능
function getCurrentSong(url) {
    try {
        // URL정보에 따른 HTML페이지 파싱
        let document = Jsoup.connect(url).get();

        // 파싱된 페이지에서 재생중인 곡명만 추출
        let songElement = document.select("tr:contains(Playing Now) a").first();

        // 추출한 곡 - 가수명에 출력문구 포함해서 결과값 저장
        return songElement
            ? `현재 재생 중인 곡은 "${songElement.text()}"입니다.`
            : "현재 재생 중인 곡 정보를 찾을 수 없습니다.";
    } catch (e) {
        // 예외 및 오류 처리
        return `오류가 발생했습니다: ${e.message}`;
    }
}

// API2 응답처리

function onMessage(msg) {
    if (msg.content === "!현재곡") { // 메시지 내용이 '안녕' 이면
        // 곡정보가 담긴 URL 주소
        const targetUrl = "http://192.168.1.102:8787/index.html?sid=1";

        // 곡정보 가져오기
        const currentSong = getCurrentSong(targetUrl);

        // Respond back in the chat room
        msg.reply(currentSong); // 곡정보 출력
    }
}

bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {}
bot.setCommandPrefix("@");
bot.addListener(Event.COMMAND, onCommand);