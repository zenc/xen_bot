if (param == "질문" || param == "q") {
    let question = msg.substr(cmdArr[0].length + 1).trim();					
    let resGpt = getChatGPTResponse(question);
    replier.reply(room, resGpt);
}


function getChatGPTResponse(msg) {
    let json;
    let result;
    try {
        let data = {
            "model": "gpt-3.5-turbo",
            "messages": [{
            "role": "system",
            "content": "당신은 모든 분야에서 최고의 전문가입니다. 20대 여성처럼 친근하게 10초 이내로 답변해주세요"
        },{"role":"user","content":msg}],
            "temperature": 0.9,
            "max_tokens": 500,
            "top_p": 1,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        };
        let response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
            .header("Authorization", "Bearer " + REST_API_KEY) // Open ai 토큰값
            .header("Content-Type", "application/json")
            .requestBody(JSON.stringify(data))
            .ignoreContentType(true)
            .ignoreHttpErrors(true)
            .timeout(200000)
            .post(); 
        json = JSON.parse(response.text());
        result = json.choices[0].message.content;
    } catch(e){
        result = e;
        Log.e(e);
    }
    return result;
}