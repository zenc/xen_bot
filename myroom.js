const bot = BotManager.getCurrentBot();


function onMessage(msg) {

    if (msg.content == "/내위치")

    msg.reply("현재 " +(room) +"이라는 방에서 " +(sender) +"이라는 닉을 사용중입니다.");

}

function onNotificationPosted(sbn, sm) {

    var packageName = sbn.getPackageName();

    if (!packageName.startsWith("com.kakao.tal")) return;

    var actions = sbn.getNotification().actions;

    if (actions == null) return;

    var userId = sbn.getUser().hashCode();

    for (var n = 0; n < actions.length; n++) {

        var action = actions[n];

        if (action.getRemoteInputs() == null) continue;

        var bundle = sbn.getNotification().extras;

​

        var msg = bundle.get("android.text").toString();

        var sender = bundle.getString("android.title");

        var room = bundle.getString("android.subText");

        if (room == null) room = bundle.getString("android.summaryText");

        var isGroupChat = room != null;

        if (room == null) room = sender;

        var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");

        var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();

        var image = bundle.getBundle("android.wearable.EXTENSIONS");

        if (image != null) image = image.getParcelable("background");

        var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);

        com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);

        if (this.hasOwnProperty("responseFix")) {

            responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);

        }

    }

}

