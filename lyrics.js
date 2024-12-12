const bot = BotManager.getCurrentBot();
const { Jsoup: Jsoup} = org.jsoup;

function onMessage(msg) {

    let cmd = msg.content.split(" ");
    
    if (cmd[0] === "/가사") {
        try {
            var query = msg.content.slice(4).trim();
            var url = org.jsoup.Jsoup.connect("http://apis.naver.com/vibeWeb/musicapiweb/v3/search/lyric?query=" + query)
                .ignoreContentType(true)  
                .get();
            
            var tracks = url.select("tracks > tracks");
    
            var resultMessage = "[🎵 '" + query + "' 가사로 검색된 노래 목록 🎶]\n\n"; 
            var maxResults = 50; // 최대 출력 개수 설정
            var count = 0;  // 출력 항목 수
    
            // 각 트랙에 대해 노래 제목, 가수 추출
            tracks.forEach(function(track) {
                if (count >= maxResults) return;
    
                var trackTitle = track.select("trackTitle").text();
                var artistName = track.select("artists > artists > artistName").text();
    
                var artistNameArray = artistName.split(" "); 
                var uniqueArtistName = Array.from(new Set(artistNameArray)).join(" "); 
    
    
                var emojiTrackTitle = "🎶 " + trackTitle;  // 🎶: 노래 제목 이모지
                var emojiArtistName = "🎤 " + uniqueArtistName;  // 🎤: 가수 이모지
    
                resultMessage += emojiTrackTitle + "\n" +
                                emojiArtistName + "\n\n";
                
                count++; 
    
                if (count === 5) {
                    resultMessage += "\u200b".repeat(500);
                }
            });
    
    
            msg.reply(resultMessage);
        } catch (e) {
            msg.reply("가사를 검색할 수 없습니다. 오류: " + e);
        }
    }
    
}

bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {}
bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단
bot.addListener(Event.COMMAND, onCommand);