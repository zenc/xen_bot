const bot = BotManager.getCurrentBot();
const { Jsoup: Jsoup} = org.jsoup; 
function onMessage(msg) {
    if (msg.content.startsWith("!주식 ")) {
        let targetMsg = msg.content.substring(4);
        msg.reply(getDart(targetMsg));
    }
}


	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 주식
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// url 샘플 (종목코드): https://m.search.naver.com/search.naver?&query=주식+엔비디아
	// url 샘플 (시세검색): https://www.google.com/search?q=주식%20엔비디아
	function getDart(msg){
		let defaultErrorMessageGetCode = "주식 코드 정보를 가져오지 못했어요.";
		let retMsg = '';
		var code = '';
		
		try{
			var target = Jsoup.connect("https://m.search.naver.com/search.naver?&query=주식+" + msg).get();
			
			if(target.select(".stock_ref").length > 0){ // 미국 주식 종목인 경우.
				target = target.select(".stock_ref").select("span");
			}else if(target.select(".stock_tlt")){ // 국내 주식 종목인 경우.
				target = target.select(".stock_tlt").select("span");
			}else{
				throw defaultErrorMessageGetCode;
			}
			
			target = target.toString();
			if(target.indexOf("ico_dot") > -1){ // 국내 주식 종목인 경우.
				target = target.split('<span class="ico_dot"></span>')[0].replace("<span>","");
			}else if(target.indexOf("exchange_name") > -1){ // 미국 주식 종목인 경우.
				target = target.split('<span class="exchange_name">')[0].replace('<span class="stock_ref">',"");
			}else{
				throw defaultErrorMessageGetCode;
			}
			code = target;
			Log.e("msg = " + msg + ", code = " + code);
		}catch(e){
			Log.e(e);
			retMsg = defaultErrorMessageGetCode;
			return retMsg;
		}
		
		try{
			var target = Jsoup.connect("https://www.google.com/search?q=주식%20" + code).get().select("g-card-section");
			
			var value = target.get(0).select("span[jsname=vWLAgc]").text();
			var unit = target.get(0).select("span[jsname=T3Us2d]").text();
			var variance = target.get(0).select("span[jsname=qRSVye]").text();
			var variance2 = target.get(0).select("span.jBBUv").text();
		
			
			retMsg += "━━━━━━━━━━\n  "; 
			retMsg += msg; 
			retMsg += "\n━━━━━━━━━━\n\n"; 
			retMsg += " - 현재가 : " + value + " " + unit +"\n"; 
			retMsg += " - 변동폭 : " + variance + " " + variance2; 
			retMsg += "\n\nBy Google";
		}catch(e){
			Log.e(e);
			retMsg = "주식 정보를 가져오지 못했어요.";
			return retMsg;
		}
		return retMsg;
	}

bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {}
bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단
bot.addListener(Event.COMMAND, onCommand);