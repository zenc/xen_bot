/*
최대한 초보 분들이 이용하시기 쉽도록, 주석으로 충분한 설명을 작성했습니다
당연한 이야기지만, 이미 잘 알고 계신 내용이라면 주석을 지우셔도 무방합니다

이 코드는 자바스크립트의 setInterval()을 이용해 특정 시간마다 반복하는 코드입니다
setInterval 함수는 특정 시간 간격을 두고 반복적으로 코드를 실행시키는 역할을 합니다
*/


let intervalId;  // 인터벌의 ID를 저장하기 위한 변수
const term = 1000 * 60 * 1;  // 1분 간격으로 실행
/*
단위가 밀리초(1/1000초)이기 때문에 1000을 곱합니다
즉, 1000 * 60 * 1 이기 때문에 60초 마다, 즉 1분 마다 실행하게 됩니다
처음부터 곱한 값을 입력해도 되지만, 위와 같은 방식으로 하면 나중에 간격을 알아보기 편합니다
*/



// 인터벌이 시작되면 실행할 코드입니다
// 예시로, 현재 시각을 문자열로 반환하는 코드를 만들었습니다
function taskRun() {

  /* ----- 여기부터 ----- */
const date = new Date();
const h = date.getHours();
const m = date.getMinutes();
const result = "현재 시각은 " + h + "시 " + m + "분 입니다";

  /* ----- 여기까지 ----- */

  // 위 공간 사이에, 실행할 코드를 만들어서 넣으시면 됩니다
  // 시각을 알려주는 건 지금 중요한 부분이 아니기 때문에, 설명은 생략합니다

return result;
  // taskRun 함수를 실행한 위치에 result(현재 시각) 라는 값을 보내줍니다
  // result는 미리 위에서 선언한 값이니, 필요에 따라 바꾸시면 됩니다
}

// 참고로, 정말 "인터벌을 실행"하는 코드는 setInterval(taskRun, term)입니다
// 아래에 나옵니다



// 인터벌 종료 함수
function taskStop() {
    clearInterval(intervalId);
/*
clearInterval은 특정 ID를 가진 인터벌을 종료하는 역할을 합니다
intervalId 변수에 ID를 저장해뒀기 때문에, 그 저장해둔 인터벌을 종료합니다
*/

    intervalId = undefined;
  // 인터벌 ID를 undefined(정의되지 않은 상태)로 바꿉니다

    return true;
  // taskStop 함수를 실행한 위치에 true 라는 값을 보내줍니다
}


// 코드를 컴파일 할 때 실행되는 함수
// 인터벌 실행 중에 코드를 컴파일 하면, 실행 중인 인터벌을 종료하기 어렵기 때문에
// 컴파일을 하면 자동으로 실행 중인 인터벌을 종료시킵니다
function onStartCompile() {
    taskStop();
}


function response(room, msg, sender, isGroupChat, replier) {
  if (msg == "!반복시작") {   // 원하는 명령어로 변경해도 상관 없습니다
    if (!!intervalId) {    // 인터벌이 실행 중인지 확인
    return replier.reply("이미 실행 중입니다");
/*
인터벌 ID는 정수 값을 가지는데,
0이 아닌 숫자에 !를 붙이면 false가 되고, 거기에 1번 더 !를 붙이면 true가 됩니다
그리고 undefined에는 !를 붙이면 true가, 1번 더 !를 붙이면 false가 됩니다
!는 true와 false를, 즉 조건의 만족 여부를 반대로 뒤집는 역할을 합니다

인터벌 ID가 이미 있다면 ! 때문에 false가 되었다가, 2번째 ! 때문에 true가 되어 조건을 만족하게 되어 반복 코드가 여러 개 같이 실행되는 것을 방지합니다
인터벌 ID가 없다면 undefined가 되기 때문에, true가 되었다가 false가 되어 조건을 만족하지 않게 되어, 새로운 반복 코드를 실행하게 됩니다
*/

/*
taskStop 함수에서 간단히 설명했듯이, return을 하면 특정 값을 함수를 실행한 곳으로 보내주고 해당 함수를 종료합니다
카카오톡 봇의 response 함수는 return을 해도 다른 곳으로 그 값을 전달할 곳이 없기 때문에 (채팅을 보내는 것과는 다릅니다)
response 함수 내에서 return을 할 경우 그냥 즉시 코드를 종료하는 것이라고 이해해도 큰 문제는 없습니다
*/
    }

    else {
        intervalId = setInterval(taskRun, term);
/*
반복을 시작합니다
taskRun이라는 함수를 term(이 코드에서는 1분) 마다 실행한다는 의미입니다
intervalId 변수에 인터벌의 ID를 저장합니다. 이 ID는 인터벌을 종료할 때 필요합니다
*/
/*
약간의 지식이 있으신 분을 위해 추가 설명을 하자면, taskRun()이 아니라 taskRun을 인자로 보내야 합니다
taskRun은 함수 참조를 의미하지만, taskRun()은 함수를 즉시 실행하여 결과를 반환하기 때문에 제대로 동작하지 않습니다
*/

    if (!!intervalId)
        return replier.reply("반복을 실행했습니다");
        // 성공적으로 인터벌을 실행했다면 intervalId 변수에 인터벌 ID가 저장됩니다

    else
        return replier.reply("반복을 실행하지 못했습니다");
        // 모종의 이유로 인터벌을 제대로 실행하지 못했다면 실패했다고 알려줍니다
        // 다시 시도해보시면 됩니다
    }
}

if (msg == "!반복종료") {    // 원하는 명령어로 변경해도 상관 없습니다
    if (!intervalId)
        return replier.reply("현재 작동 중인 인터벌이 없습니다");
/*
반복을 시작할 때와 같은 원리이지만, !가 하나 더 적습니다
즉, true와 false를 1번만 뒤집게 됩니다
만약 인터벌 ID가 없다면 undefined일 것이고, 이것을 뒤집으면 true가 되어 "작동 중인 코드가 없는 것이 맞다"는 의미가 됩니다
종료할 인터벌이 없으니 채팅으로 알림만 보내는 것이죠

인터벌 ID가 있다면 정수 값일테고, 이를 뒤집으면 false가 되어 "작동 중인 코드가 없지 않다 (있다)"는 의미가 됩니다
따라서 인터벌을 종료하기 위한 구문으로 들어가게 됩니다
*/

        if (taskStop())
            return replier.reply("반복을 종료했습니다");
/*
taskStop 함수에서는 true를 보내주기 때문에
( ) 안에는 true라는 값이 들어가게 됩니다
정상적으로 taskStop 함수가 실행되었다면 조건문을 만족하게 됩니다
*/

        else
            return replier.reply("반복을 종료하지 못했습니다");
/*
만약 taskStop 함수가 제대로 실행되지 않았다면 true라는 값을 받지 못하고
( ) 안에 undefined가 들어가게 됩니다
이 경우에는 조건문을 만족하지 못한 것이므로 else 쪽의 코드가 실행됩니다
*/
    }
}