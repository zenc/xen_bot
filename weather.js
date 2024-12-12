const scriptName = "날씨";
const { Jsoup: Jsoup} = org.jsoup; 
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    if (msg.startsWith("!날씨 ")) {
        let targetMsg = msg.substring(4);
        replier.reply(getWeatherFromNaver(targetMsg));
    }
}

function getWeatherFromNaver(msg){   
    let retMsg = '';
        try{   
            var data = Jsoup.connect("https://m.search.naver.com/search.naver?&query=날씨+" + msg).get();
            
            // 검색 지역
            let geo = data.select(".top_wrap").select(".select_txt").text();
            ///////////////////////////////////////////
            // 오늘 정보
            ///////////////////////////////////////////
            let todayWeatherInfo = data.select(".weather_info")[0];             
            let today = todayWeatherInfo.select("._today");
            // 오늘 기온 = 28.2°
            let today_temp = today.select(".temperature_text strong").text().slice(5);
            // 어제와 기온 차이 = 어제보다 1.6° 낮아요
            let diff_temp = todayWeatherInfo.select(".temperature_info .temperature").text();
            // 오늘 오전 강수 확률 = 60%
            let todayRaining1 = data.select(".list_box").select("li.week_item")[0].select("span.weather_inner").get(0).select(".rainfall").text();
            // 오늘 오후 강수 확률 = 60%
            let todayRaining2 = data.select(".list_box").select("li.week_item")[0].select("span.weather_inner").get(1).select(".rainfall").text();    
            
            let feeling = '';
            let humidity = '';
            let wind = '';
            let precipitation = '';

            let temperature_info = todayWeatherInfo.select(".temperature_info .sort");

            for(var i = 0; i < temperature_info.length; i++){
                if(temperature_info[i].select(".term").text().trim().indexOf('체감') > -1){
                    // 체감온도 = 30.2°
                    feeling = temperature_info[i].select(".desc").text().trim();
                }
                if(temperature_info[i].select(".term").text().trim().indexOf('강수') > -1){
                    // 강수 = 11mm
                    precipitation = temperature_info[i].select(".desc").text().trim();
                }
                if(temperature_info[i].select(".term").text().trim().indexOf('습도') > -1){
                    // 습도 = 60%
                    humidity = temperature_info[i].select(".desc").text().trim();
                }
                if(temperature_info[i].select(".term").text().trim().indexOf('풍') > -1){
                    // 남동풍 = 2.8m/s
                    wind = temperature_info[i].select(".desc").text().trim();
                }
            }
            
            // 미세먼지 = 좋음
            let fineDust = '';
            // 초 미세먼지 = 좋음
            let ultraFineDust = '';
            // 자외선 = 보통
            let uvRays = '';
            // 일몰 = 19:44
            let sunset = '';

            let todayReports = todayWeatherInfo.select(".report_card_wrap").select("li.item_today");
            for(var i = 0; i < todayReports.length; i++){
                if(todayReports[i].select(".title").text().trim() == '미세먼지'){
                    // 미세먼지 = 좋음
                    fineDust = todayReports[i].select(".txt").text().trim();
                }
                if(todayReports[i].select(".title").text().trim().indexOf('초미세먼지') > -1){
                    // 초미세먼지 = 좋음
                    ultraFineDust = todayReports[i].select(".txt").text().trim();
                }
                if(todayReports[i].select(".title").text().trim().indexOf('자외선') > -1){
                    // 자외선 = 보통
                    uvRays = todayReports[i].select(".txt").text().trim();
                }
                if(todayReports[i].select(".title").text().trim().indexOf('일몰') > -1){
                    // 일몰 = 19:44
                    sunset = todayReports[i].select(".txt").text().trim();
                }
            }


            ///////////////////////////////////////////
            // 내일 정보
            ///////////////////////////////////////////
            let tomorrow = data.select(".weather_info")[1];
            // 내일 오전 기온 = 30.2°
            let tomorrowTemp_AM = tomorrow.select(".temperature_text").get(0).text().replace("예측 온도","");
            // 내일 오후 기온 = 30.2°
            let tomorrowTemp_PM = tomorrow.select(".temperature_text").get(1).text().replace("예측 온도","");
            // 내일 오전 간략 = 흐리고 비
            let tomorrowSummary_AM = tomorrow.select(".temperature_info").get(0).select(".summary").text();
            // 내일 오전 강수 확률
            let tomorrowRaining_AM = tomorrow.select(".temperature_info").get(0).select(".desc").text();
            // 내일 오후 간략 = 구름 많고 한때 비
            let tomorrowSummary_PM = tomorrow.select(".temperature_info").get(1).select(".summary").text();
            // 내일 오후 강수 확률
            let tomorrowRaining_PM = tomorrow.select(".temperature_info").get(1).select(".desc").text();
            // 내일 오전 미세먼지 = 좋음
            let tomorrowFineDust_AM = tomorrow.select(".report_card_wrap").get(0).select("li.item_today").get(0).select(".txt").text();
            // 내일 오전 초 미세먼지 = 좋음
            let tomorrowUltraFineDust_AM = tomorrow.select(".report_card_wrap").get(0).select("li.item_today").get(1).select(".txt").text();
            // 내일 오후 미세먼지 = 좋음
            let tomorrowFineDust_PM = tomorrow.select(".report_card_wrap").get(1).select("li.item_today").get(0).select(".txt").text();
            // 내일 오후 초 미세먼지 = 좋음
            let tomorrowUltraFineDust_PM = tomorrow.select(".report_card_wrap").get(1).select("li.item_today").get(1).select(".txt").text();
    
            retMsg += "━━━━━━━━━━━━━━\n  "; 
            retMsg += "오늘 " + geo + " 날씨"; 
            retMsg += "\n━━━━━━━━━━━━━━";        
            retMsg += "\n온도 : " + today_temp + " (어제보다 " + diff_temp + ")";
            retMsg += "\n강수확률 (오전/오후) : " + todayRaining1 + "/" + todayRaining2;
            if(precipitation != ''){
                retMsg += "\n강수량 : " + precipitation;
            }
            if(feeling != ''){
                retMsg += "\n체감온도 : " + feeling;
            }
            if(humidity != ''){
                retMsg += "\n습도 : " + humidity;
            }
            if(wind != ''){
                retMsg += "\n풍속 : " + wind;
            }
            if(fineDust != ''){
                retMsg += "\n미세먼지 : " + fineDust;
            }
            if(ultraFineDust != ''){
                retMsg += "\n초미세먼지 : " + ultraFineDust;
            }
            if(uvRays != ''){
                retMsg += "\n자외선 : " + uvRays;
            }
            if(sunset != ''){
                retMsg += "\n일몰 : " + sunset;
            }
            retMsg += "\n\n━━━━━━━━━━━━━━\n  "; 
            retMsg += "내일 " + geo + " 날씨 예상"; 
            retMsg += "\n━━━━━━━━━━━━━━";   
            retMsg += "\n - 오전"; 
            retMsg += "\n  - " + tomorrowSummary_AM;
            retMsg += "\n  - 온도 : " + tomorrowTemp_AM;
            retMsg += "\n  - 강수확률 : " + tomorrowRaining_AM;
            retMsg += "\n  - 미세먼지 : " + tomorrowFineDust_AM;
            retMsg += "\n  - 초미세먼지 : " + tomorrowUltraFineDust_AM;
            retMsg += "\n - 오후"; 
            retMsg += "\n  - " + tomorrowSummary_PM;
            retMsg += "\n  - 온도 : " + tomorrowTemp_PM;
            retMsg += "\n  - 강수확률 : " + tomorrowRaining_PM;
            retMsg += "\n  - 미세먼지 : " + tomorrowFineDust_PM;
            retMsg += "\n  - 초미세먼지 : " + tomorrowUltraFineDust_PM;
            retMsg += "\n\nBy Naver";
        }catch(e){
            retMsg = "날씨 정보를 가져오지 못했어요.";
            Log.e(e);
        }
        return retMsg;
}