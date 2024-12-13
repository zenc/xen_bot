// 필요한 모듈을 가져옵니다. 이 모듈은 데이터베이스와 사용자 입력 처리를 위해 사용됩니다.
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

// readline 인터페이스를 설정하여 사용자 입력과 출력을 처리합니다.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// SQLite 데이터베이스를 열어 퀴즈 제목 데이터를 관리합니다.
const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) console.error('Error opening database:', err);
});

// 퀴즈 문제 수를 지정합니다.
const TOTAL_QUESTIONS = 10;

// 테이블이 존재하지 않을 경우 생성합니다.
const setupDatabase = () => {
  db.run(`CREATE TABLE IF NOT EXISTS titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre TEXT NOT NULL,
    title TEXT NOT NULL
  )`, () => {
    console.log('데이터베이스 준비 완료.');
  });
};

// 제목을 한글 초성으로 변환하는 함수입니다.
const getInitialConsonants = (title) => {
  const HANGUL_START = 0xac00;
  const CHO = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
    'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  return title.split('').map(char => {
    const code = char.charCodeAt(0) - HANGUL_START;
    if (code >= 0 && code < 11172) {
      const choIndex = Math.floor(code / 588);
      return CHO[choIndex];
    }
    return char; // 한글이 아닌 문자는 그대로 반환합니다.
  }).join('');
};

// 선택된 장르에서 무작위로 제목을 가져오는 함수입니다.
const getRandomTitle = (genre, callback) => {
  db.get(`SELECT title FROM titles WHERE genre = ? ORDER BY RANDOM() LIMIT 1`, [genre], (err, row) => {
    if (err) {
      console.error('제목을 가져오는 중 오류 발생:', err);
      callback(null);
    } else {
      callback(row ? row.title : null);
    }
  });
};

// 게임 로직을 처리하는 주요 부분입니다.
const playGame = () => {
  const players = {};
  let questionCount = 0;

  const askQuestion = () => {
    if (questionCount >= TOTAL_QUESTIONS) {
      displayRankings();
      return;
    }

    rl.question('장르를 선택하세요 (movie, song, drama): ', (genre) => {
      getRandomTitle(genre, (title) => {
        if (!title) {
          console.log('선택한 장르에 대한 제목을 찾을 수 없습니다. 다시 시도하세요.');
          askQuestion();
          return;
        }

        const initials = getInitialConsonants(title);
        console.log(`문제 ${questionCount + 1}: ${initials}`);

        rl.question('정답: ', (answer) => {
          if (answer === title) {
            console.log('정답입니다!');

            const player = rl.questionSync('이름을 입력하세요: ');
            if (!players[player]) players[player] = 0;
            players[player]++;
          } else {
            console.log(`오답입니다. 정답은: ${title}`);
          }

          questionCount++;
          askQuestion();
        });
      });
    });
  };

  const displayRankings = () => {
    console.log('\n게임 종료! 순위는 다음과 같습니다:');

    const sortedPlayers = Object.entries(players)
      .sort(([, aPoints], [, bPoints]) => bPoints - aPoints)
      .slice(0, 3);

    sortedPlayers.forEach(([player, points], index) => {
      console.log(`${index + 1}위: ${player} - ${points}점`);
    });

    rl.close();
    db.close();
  };

  askQuestion();
};

// 데이터베이스를 초기화하고 게임을 시작합니다.
setupDatabase();
playGame();
