const scriptName = "현재곡";
const { Jsoup } = org.jsoup;

// Function to fetch the currently playing song
function getCurrentSong(url) {
    try {
        // Connect to the URL and parse the HTML
        let document = Jsoup.connect(url).get();

        // Extract the currently playing song
        let songElement = document.select("tr:contains(Playing Now) a").first();

        // If the song is found, return the custom message; otherwise, return a fallback message
        return songElement
            ? `현재 재생 중인 곡은 "${songElement.text()}"입니다.`
            : "현재 재생 중인 곡 정보를 찾을 수 없습니다.";
    } catch (e) {
        // Return an error message in case of exceptions
        return `오류가 발생했습니다: ${e.message}`;
    }
}

// Main function for API2 response
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith("!현재곡")) {
        // Define the URL for the song info
        const targetUrl = "http://192.168.1.102:8787/index.html?sid=1";

        // Fetch the song name
        const currentSong = getCurrentSong(targetUrl);

        // Respond back in the chat room
        replier.reply(currentSong);
    }
}

