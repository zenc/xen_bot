const bot = BotManager.getCurrentBot();
const { Jsoup: Jsoup} = org.jsoup;

function onMessage(msg) {
    if (msg.content.substr(0, 2) == "젠~") {
        var question = msg.content.substr(3);      
        let resGem = getGeminiResponse(question);
        msg.reply(resGem);
    }
}

bot.addListener(Event.MESSAGE, onMessage);

function getGeminiResponse(msg) {    
    let json;    
    let result;    
    try {        
        let response = org.jsoup.Jsoup.connect("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDGmpJ0t1MyGZMxwadXIwPDvM3_T6v7ujU")            
        .header("Content-Type", "application/json")            
        .requestBody(JSON.stringify({      
            "contents" : [{         
                "parts" : [{            
                    "text": msg}]}]}))       
                    .method(org.jsoup.Connection.Method.POST)       
                    .ignoreContentType(true)            
                    .ignoreHttpErrors(true)            
                    .timeout(200000)            
                    .post();         
                    json = JSON.parse(response.text());        
                    result = json.candidates[0].content.parts[0].text;    
                } catch(e){        
                    result = e;        
                    Log.e(e);    
                }    
                return result; 
            }
            
/* function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {      
    if (msg.substr(0, 3) == "!질문") {      
        var question = msg.substr(4);      
        let resGem = getGeminiResponse(question);      
        Api.replyRoom(room, resGem);          
    }
}
*/
function onCommand(msg) {}
bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단
bot.addListener(Event.COMMAND, onCommand);