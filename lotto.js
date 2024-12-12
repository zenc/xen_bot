const bot = BotManager.getCurrentBot();
function onMessage(msg) {
    if (msg.content.substr(0, 3) == "/로또") {
    var lotto = [];
        for (var n = 0; n < 7; n++) {
            var ran = Math.floor(Math.random() * 45) + 1;
            if (lotto.includes(ran)) n--;
            else lotto.push(ran);
        }
        var bonus = lotto.pop();
        msg.reply("로또 결과 : " + lotto.join(", ") + " + " + bonus);
    }
}
bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {}
bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단
bot.addListener(Event.COMMAND, onCommand);