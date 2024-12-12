const bot = BotManager.getCurrentBot();
function pplxApiQuery(pplxQuery) {
    try {
        const PPLX_API_KEY = "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"; // 사용하시는 API 키 입력
        const pplxUrl = "https://api.perplexity.ai/chat/completions";
        const pplxHeaders = {
            "Authorization": "Bearer " + PPLX_API_KEY,
            "Content-Type": "application/json"
        };

        const pplxBody = JSON.stringify({
            "model": "Claude 3.5 Haiku", //사용 모델
            "messages": [{"role": "user", "content": pplxQuery}],
            "temperature": 0.1, 
            "top_p": 0.1
        });

        const pplxResponse = org.jsoup.Jsoup.connect(pplxUrl)
            .ignoreContentType(true)
            .header("Authorization", pplxHeaders.Authorization)
            .header("Content-Type", pplxHeaders["Content-Type"])
            .requestBody(pplxBody)
            .method(org.jsoup.Connection.Method.POST)
            .timeout(90000)
            .execute();

        const pplxResponseBody = pplxResponse.body();
        const pplxJsonResponse = JSON.parse(pplxResponseBody);

        if (pplxJsonResponse.choices && pplxJsonResponse.choices.length > 0) {
            return pplxJsonResponse.choices[0].message.content;
        } else {
            return "Perplexity API에서 응답을 받지 못했습니다.";
        }
    } catch (pplxError) {
        return "Perplexity API 오류 발생: " + pplxError.message + "\n상세 정보: " + pplxError.toString();
    }
}




function onMessage(msg) {

if (msg.content.startsWith("젠!")) {
    const command = msg.content.split(" ")[0];
    const query = msg.content.substring(command.length).trim();

    try {
        const pplxAnswer = pplxApiQuery(query);
        msg.reply(pplxAnswer);
    } catch (error) {
        msg.reply("검색 기능에 문제가 발생했습니다. API 키를 확인해주세요.");
    }
}
}

bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {}
bot.setCommandPrefix("@");
bot.addListener(Event.COMMAND, onCommand);
