// ==========================================
// 全局變數與「天氣小達人」題庫宣告區
// ==========================================

let quizData = [
  {
    id: 0,
    question: "今天太陽很大，出門要做好什麼準備呢？",
    options: ["戴遮陽帽和塗防曬", "穿雨衣拿雨傘", "穿厚羽絨大衣"],
    correct: 0,
    explanation: "好棒！大太陽出門要防曬，保護皮膚才健康喔！",
    speechText: "今天太陽很大，出門要戴遮陽帽和塗防曬",
    type: "sunny"
  },
  {
    id: 1,
    question: "外面正在下大雨，上學出門記得帶什麼？",
    options: ["太陽眼鏡", "雨傘或雨衣", "厚重圍巾"],
    correct: 1,
    explanation: "答對了！下雨天出門記得撐雨傘，才不會淋濕感冒！",
    speechText: "外面正在下大雨，上學出門記得帶雨傘或雨衣",
    type: "rainy"
  },
  {
    id: 2,
    question: "冬天氣溫好低、好冷，我們應該怎麼穿衣服？",
    options: ["穿短袖和夾腳拖", "穿保暖外套和長褲", "穿泳衣去游泳"],
    correct: 1,
    explanation: "答對囉！天冷要穿暖和的外套，這樣才不會感冒發燒！",
    speechText: "冬天氣溫好冷，我們應該穿保暖外套和長褲",
    type: "cold"
  },
  {
    id: 3,
    question: "發布颱風假囉！外面風雨很大，小朋友應該去哪裡？",
    options: ["去公園溜滑梯", "去海邊看大浪", "乖乖待在家裡最安全"],
    correct: 2,
    explanation: "太棒了！颱風天風雨交加，待在家裡才是最安全的喔！",
    speechText: "颱風天外面風雨很大，小朋友應該乖乖待在家裡",
    type: "typhoon"
  },
  {
    id: 4,
    question: "天空打雷又閃電了，我們應該怎麼做？",
    options: ["躲在大樹下避雨", "趕快進室內並遠離電器", "拿金屬鐵棒在戶外跑"],
    correct: 1,
    explanation: "答對了！打雷時要趕快進到室內，千萬不要在大樹下躲雨！",
    speechText: "打雷閃電時，我們應該趕快進室內並遠離電器",
    type: "thunder"
  }
];

// 遊戲狀態：'HOME' (首頁), 'PLAYING' (答題中), 'FEEDBACK' (看解析), 'RESULT' (成績單)
let gameState = 'HOME';

// 測驗進度追蹤
let currentQuestionIndex = 0;
let userAnswers = []; // 記錄用戶每題的選擇與對錯
let score = 0;

// 動畫與音效計時器
let animAngle = 0;

// UI 按鈕物件
let startButton = { x: 0, y: 0, w: 260, h: 65 };
let nextButton = { x: 0, y: 0, w: 260, h: 65 };
let restartButton = { x: 0, y: 0, w: 260, h: 65 };
let optionButtons = []; // 動態產生的選項按鈕

let selectedOption = null; // 當前點選的選項
let isAnswerCorrect = false;

// 彩蛋煙火粒子
let confettiParticles = [];

// 蘋果動態島狀態
let dynamicIsland = {
  x: 0, y: 15, w: 200, h: 36,
  targetW: 200, targetH: 36,
  text: "天氣小達人測驗",
  isSpeaking: false
};

// ==========================================
// p5.js 核心初始化 setup()
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initLayout();
}

// ==========================================
// 響應式佈局初始化 initLayout()
// ==========================================
function initLayout() {
  dynamicIsland.x = width / 2;

  // 按鈕尺寸計算
  startButton.x = width / 2 - startButton.w / 2;
  startButton.y = height / 2 + 100;

  nextButton.x = width / 2 - nextButton.w / 2;
  nextButton.y = height - 90;

  restartButton.x = width / 2 - restartButton.w / 2;
  restartButton.y = height - 100;

  updateOptionButtonsLayout();
}

// ==========================================
// 更新選項按鈕位置（響應式）
// ==========================================
function updateOptionButtonsLayout() {
  optionButtons = [];
  let btnW = min(width * 0.8, 550);
  let btnH = min(height * 0.1, 65);
  let startY = height * 0.48;
  let gapY = btnH + 15;

  if (gameState === 'PLAYING' || gameState === 'FEEDBACK') {
    let q = quizData[currentQuestionIndex];
    for (let i = 0; i < q.options.length; i++) {
      optionButtons.push({
        x: width / 2 - btnW / 2,
        y: startY + i * gapY,
        w: btnW,
        h: btnH,
        text: q.options[i],
        index: i
      });
    }
  }
}

// ==========================================
// 視窗大小改變 (windowResized)
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLayout();
}

// ==========================================
// 主繪製循環 draw()
// ==========================================
function draw() {
  background('#F2F2F7'); // iOS 淺灰背景
  animAngle += 0.05;

  if (gameState === 'HOME') {
    drawHomeScreen();
  } else if (gameState === 'PLAYING' || gameState === 'FEEDBACK') {
    drawQuizScreen();
    drawDynamicIsland();
  } else if (gameState === 'RESULT') {
    drawResultScreen();
  }
}

// ==========================================
// 1. 繪製首頁
// ==========================================
function drawHomeScreen() {
  push();
  // 裝飾背景卡片
  fill(255);
  noStroke();
  let cardW = min(width * 0.85, 600);
  let cardH = min(height * 0.75, 500);
  let cardX = width / 2 - cardW / 2;
  let cardY = height / 2 - cardH / 2;
  rect(cardX, cardY, cardW, cardH, 30);

  // 標題與圖示
  textSize(50);
  text("☀️", width / 2, cardY + 80);

  fill('#1C1C1E');
  textSize(min(width * 0.05, 36));
  textStyle(BOLD);
  text("天氣小達人生活常識測驗", width / 2, cardY + 150);

  textSize(20);
  fill('#636366');
  text("快來學習晴天、雨天、颱風天的安全常識吧！", width / 2, cardY + 210);

  // 開始測驗按鈕 (iOS 藍色膠囊)
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 6;
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 122, 255, 0.3)';

  fill('#007AFF');
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 30);

  fill(255);
  textSize(24);
  textStyle(BOLD);
  text("🚀 開始測驗", startButton.x + startButton.w / 2, startButton.y + startButton.h / 2);
  pop();
}

// ==========================================
// 2. 繪製答題與回饋畫面
// ==========================================
function drawQuizScreen() {
  let q = quizData[currentQuestionIndex];

  // 頂部進度條
  push();
  fill('#E5E5EA');
  noStroke();
  rect(width / 2 - 150, 75, 300, 8, 4);
  fill('#007AFF');
  rect(width / 2 - 150, 75, 300 * ((currentQuestionIndex + 1) / quizData.length), 8, 4);

  // 題號
  textSize(16);
  fill('#8E8E93');
  textStyle(BOLD);
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${quizData.length} 題`, width / 2, 105);
  pop();

  // 上方動畫與情境圖示區
  drawWeatherAnimation(q.type);

  // 題目文字
  push();
  fill('#1C1C1E');
  textSize(min(width * 0.04, 24));
  textStyle(BOLD);
  text(q.question, width / 2, height * 0.38);
  pop();

  // 繪製下方選項大按鈕
  for (let btn of optionButtons) {
    push();
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 3;
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = 'rgba(0,0,0,0.06)';

    let btnColor = '#FFFFFF';
    let textColor = '#1C1C1E';
    let borderColor = 'rgba(0,0,0,0.08)';

    // 如果已經作答 (進入 FEEDBACK 階段) 顯示對錯顏色
    if (gameState === 'FEEDBACK') {
      if (btn.index === q.correct) {
        btnColor = '#34C759'; // 正確顯示綠色
        textColor = '#FFFFFF';
      } else if (btn.index === selectedOption) {
        btnColor = '#FF3B30'; // 錯誤顯示紅色
        textColor = '#FFFFFF';
      }
    }

    fill(btnColor);
    stroke(borderColor);
    strokeWeight(1.5);
    rect(btn.x, btn.y, btn.w, btn.h, 18);

    drawingContext.shadowColor = 'transparent';
    fill(textColor);
    textSize(min(btn.w * 0.045, 20));
    textStyle(BOLD);
    text(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);
    pop();
  }

  // 如果在 FEEDBACK 狀態，顯示解析與「下一題」按鈕
  if (gameState === 'FEEDBACK') {
    push();
    fill(0, 0, 0, 140);
    rect(0, 0, width, height);

    // 解析彈窗
    fill(255);
    noStroke();
    let boxW = min(width * 0.85, 500);
    let boxH = 240;
    let boxX = width / 2 - boxW / 2;
    let boxY = height / 2 - boxH / 2;
    rect(boxX, boxY, boxW, boxH, 24);

    textSize(28);
    text(isAnswerCorrect ? "🎉 答對了！" : "❌ 答錯囉！", width / 2, boxY + 45);

    textSize(18);
    fill('#3A3A3C');
    textStyle(NORMAL);
    // 自動斷行顯示解說
    text(q.explanation, boxX + 20, boxY + 90, boxW - 40, 60);

    // 下一題按鈕 (iOS 綠色或藍色)
    fill('#34C759');
    rect(nextButton.x, boxY + boxH - 70, nextButton.w, 50, 25);

    fill(255);
    textSize(20);
    textStyle(BOLD);
    text(currentQuestionIndex < quizData.length - 1 ? "➡️ 下一題" : "🏆 看總成績", nextButton.x + nextButton.w / 2, boxY + boxH - 45);
    pop();
  }
}

// ==========================================
// 各類天氣動態動畫繪製
// ==========================================
function drawWeatherAnimation(type) {
  push();
  let cx = width / 2;
  let cy = height * 0.22;

  switch (type) {
    case 'sunny': // 太陽閃爍
      fill('#FF9500');
      noStroke();
      let sSize = 60 + sin(animAngle * 3) * 6;
      ellipse(cx, cy, sSize, sSize);
      for (let i = 0; i < 8; i++) {
        let angle = i * (TWO_PI / 8) + animAngle;
        let x1 = cx + cos(angle) * 40;
        let y1 = cy + sin(angle) * 40;
        let x2 = cx + cos(angle) * 52;
        let y2 = cy + sin(angle) * 52;
        stroke('#FF9500');
        strokeWeight(4);
        line(x1, y1, x2, y2);
      }
      break;

    case 'rainy': // 下雨天
      fill('#007AFF');
      noStroke();
      for (let i = -2; i <= 2; i++) {
        let dropY = (frameCount * 4 + i * 25) % 50;
        rect(cx + i * 25, cy - 20 + dropY, 3, 15, 2);
      }
      textSize(40);
      text("🌧️", cx, cy);
      break;

    case 'cold': // 冬天雪花
      fill('#5856D6');
      noStroke();
      textSize(45);
      let snowY = sin(animAngle * 2) * 8;
      text("❄️ 🧣", cx, cy + snowY);
      break;

    case 'typhoon': // 颱風旋轉
      push();
      translate(cx, cy);
      rotate(animAngle * 3);
      textSize(45);
      text("🌀", 0, 0);
      pop();
      break;

    case 'thunder': // 雷電交加
      textSize(45);
      let flash = (frameCount % 30 < 5) ? "⚡" : "☁️";
      text(flash, cx, cy);
      break;
  }
  pop();
}

// ==========================================
// 3. 繪製成績與結算畫面
// ==========================================
function drawResultScreen() {
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  push();
  fill(255);
  noStroke();
  let dialogW = min(width * 0.9, 520);
  let dialogH = min(height * 0.85, 550);
  let dialogX = width / 2 - dialogW / 2;
  let dialogY = height / 2 - dialogH / 2;
  rect(dialogX, dialogY, dialogW, dialogH, 30);

  // 標題
  fill('#1C1C1E');
  textSize(30);
  textStyle(BOLD);
  text("🏆 天氣小達人測驗結算 🏆", width / 2, dialogY + 45);

  // 計算分數百分比
  let percentage = round((score / quizData.length) * 100);

  // 顯示星星 (依答對題數)
  let starsCount = round((score / quizData.length) * 3);
  let starStr = "";
  for (let i = 0; i < 3; i++) {
    starStr += (i < starsCount) ? "⭐ " : "☆ ";
  }
  textSize(28);
  text(starStr, width / 2, dialogY + 95);

  // 分數與評語
  textSize(42);
  fill(percentage >= 80 ? '#34C759' : '#FF9500');
  text(percentage + " 分", width / 2, dialogY + 155);

  // 每題對錯清單小結
  textSize(16);
  textStyle(NORMAL);
  fill('#3A3A3C');
  let startListY = dialogY + 200;
  for (let i = 0; i < userAnswers.length; i++) {
    let statusText = userAnswers[i].isCorrect ? "✅ 正確" : "❌ 錯誤";
    let statusColor = userAnswers[i].isCorrect ? '#34C759' : '#FF3B30';
    
    push();
    fill('#8E8E93');
    text(`第 ${i + 1} 題:`, dialogX + 50, startListY + i * 32);
    fill(statusColor);
    textStyle(BOLD);
    text(statusText, dialogX + 130, startListY + i * 32);
    pop();
  }

  // 彩蛋煙火
  if (percentage > 80) {
    updateAndDrawConfetti();
  }

  // 再測驗一次按鈕
  fill('#007AFF');
  rect(restartButton.x, dialogY + dialogH - 75, restartButton.w, 50, 25);

  fill(255);
  textSize(20);
  textStyle(BOLD);
  text("🔄 重新測驗", restartButton.x + restartButton.w / 2, dialogY + dialogH - 50);
  pop();
}

// ==========================================
// 蘋果動態島繪製
// ==========================================
function drawDynamicIsland() {
  push();
  dynamicIsland.w = lerp(dynamicIsland.w, dynamicIsland.targetW, 0.15);
  dynamicIsland.h = lerp(dynamicIsland.h, dynamicIsland.targetH, 0.15);

  rectMode(CENTER);
  noStroke();
  fill(0);
  rect(dynamicIsland.x, dynamicIsland.y + dynamicIsland.h / 2, dynamicIsland.w, dynamicIsland.h, dynamicIsland.h / 2);

  fill(255);
  textSize(13);
  textStyle(BOLD);

  if (dynamicIsland.isSpeaking) {
    text(dynamicIsland.text, dynamicIsland.x - 15, dynamicIsland.y + dynamicIsland.h / 2);
    fill('#34C759');
    for (let i = 0; i < 3; i++) {
      let waveH = sin(animAngle * 5 + i) * 6 + 10;
      rect(dynamicIsland.x + dynamicIsland.w / 2 - 25 + (i * 7), dynamicIsland.y + dynamicIsland.h / 2, 3, waveH, 2);
    }
  } else {
    text(dynamicIsland.text, dynamicIsland.x, dynamicIsland.y + dynamicIsland.h / 2);
  }
  rectMode(CORNER);
  pop();
}

// ==========================================
// 滑鼠/觸控點擊事件 mousePressed()
// ==========================================
function mousePressed() {
  if (gameState === 'HOME') {
    // 點擊開始測驗
    if (
      mouseX >= startButton.x && mouseX <= startButton.x + startButton.w &&
      mouseY >= startButton.y && mouseY <= startButton.y + startButton.h
    ) {
      gameState = 'PLAYING';
      currentQuestionIndex = 0;
      score = 0;
      userAnswers = [];
      updateOptionButtonsLayout();
      playCurrentQuestionSpeech(); // 自動播放第一題語音
    }
  } 
  else if (gameState === 'PLAYING') {
    // 1. 點擊上方動畫區可以重新聼語音
    if (mouseY < height * 0.35) {
      playCurrentQuestionSpeech();
      return;
    }

    // 2. 點擊選項按鈕
    for (let btn of optionButtons) {
      if (
        mouseX >= btn.x && mouseX <= btn.x + btn.w &&
        mouseY >= btn.y && mouseY <= btn.y + btn.h
      ) {
        selectedOption = btn.index;
        let q = quizData[currentQuestionIndex];
        isAnswerCorrect = (selectedOption === q.correct);

        if (isAnswerCorrect) {
          score++;
        }

        // 記錄成績
        userAnswers.push({
          questionId: q.id,
          isCorrect: isAnswerCorrect
        });

        // 進入解析回饋狀態
        gameState = 'FEEDBACK';
        break;
      }
    }
  } 
  else if (gameState === 'FEEDBACK') {
    // 點擊「下一題」按鈕
    let boxH = 240;
    let boxY = height / 2 - boxH / 2;
    let btnY = boxY + boxH - 70;

    if (
      mouseX >= nextButton.x && mouseX <= nextButton.x + nextButton.w &&
      mouseY >= btnY && mouseY <= btnY + 50
    ) {
      if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        gameState = 'PLAYING';
        updateOptionButtonsLayout();
        playCurrentQuestionSpeech(); // 自動播放下一題語音
      } else {
        gameState = 'RESULT';
        let percentage = round((score / quizData.length) * 100);
        if (percentage > 80) {
          createConfetti();
        }
      }
    }
  } 
  else if (gameState === 'RESULT') {
    // 點擊重新測驗
    let dialogH = min(height * 0.85, 550);
    let dialogY = height / 2 - dialogH / 2;
    let btnY = dialogY + dialogH - 75;

    if (
      mouseX >= restartButton.x && mouseX <= restartButton.x + restartButton.w &&
      mouseY >= btnY && mouseY <= btnY + 50
    ) {
      gameState = 'HOME';
      confettiParticles = [];
    }
  }
}

// ==========================================
// 自動播放目前題目語音
// ==========================================
function playCurrentQuestionSpeech() {
  let q = quizData[currentQuestionIndex];
  speakText(q.speechText);
  triggerDynamicIsland("語音播放中...");
}

// ==========================================
// 瀏覽器語音合成 Web Speech API
// ==========================================
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

// ==========================================
// 觸發動態島
// ==========================================
function triggerDynamicIsland(msg) {
  dynamicIsland.text = msg;
  dynamicIsland.targetW = 260;
  dynamicIsland.targetH = 44;
  dynamicIsland.isSpeaking = true;

  setTimeout(() => {
    dynamicIsland.targetW = 200;
    dynamicIsland.targetH = 36;
    dynamicIsland.text = "天氣小達人測驗";
    dynamicIsland.isSpeaking = false;
  }, 2000);
}

// ==========================================
// 彩蛋煙火粒子生成 (Confetti)
// ==========================================
function createConfetti() {
  confettiParticles = [];
  let colors = ['#FF2D55', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6'];

  for (let i = 0; i < 180; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(10, 18),
      color: random(colors),
      vx: random(-2.5, 2.5),
      vy: random(4, 9),
      rotation: random(TWO_PI),
      vRot: random(-0.12, 0.12)
    });
  }
}

// ==========================================
// 更新與繪製彩蛋煙火
// ==========================================
function updateAndDrawConfetti() {
  for (let p of confettiParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.vRot;

    if (p.y > height) {
      p.y = random(-50, -10);
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(p.color);
    noStroke();
    rect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6, 2);
    pop();
  }
}