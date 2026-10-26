/**
 * ==============================================================================
 * โครงการ: นักผจญภัยตามล่าหลักฐานทางประวัติศาสตร์ (Grade 4 History Adventure)
 * ไฟล์: js/game.js (ตรรกะเกมและการจัดการหน้าจอ)
 * ==============================================================================
 */

// สถานะเกมทั้งหมด (Game State)
const state = {
  currentScreen: 'welcome',
  nickname: '',
  avatar: 'boy',
  currentStageIndex: 0,
  unlockedStageIndex: 0,
  stageResults: [], // เก็บผลแต่ละด่าน: { stageId, chosenIndex, isCorrect, points }
  totalScore: 0,
  startTime: null,
  endTime: null,
  hasAnsweredCurrentStage: false
};

// ==============================================================================
// DOM Elements
// ==============================================================================
const dom = {
  // Screens
  screens: {
    welcome: document.getElementById('screen-welcome'),
    map: document.getElementById('screen-map'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result')
  },

  // Audio / Global Controls
  btnSoundToggle: document.getElementById('btn-sound-toggle'),
  btnInfoModal: document.getElementById('btn-info-modal'),
  btnSheetsModal: document.getElementById('btn-sheets-modal'),

  // Welcome Screen
  playerNickname: document.getElementById('player-nickname'),
  avatarSelector: document.getElementById('avatar-selector'),
  btnStartGame: document.getElementById('btn-start-game'),

  // Map Screen
  mapAvatarIcon: document.getElementById('map-avatar-icon'),
  mapPlayerName: document.getElementById('map-player-name'),
  mapScoreDisplay: document.getElementById('map-score-display'),
  mapStagesContainer: document.getElementById('map-stages-container'),
  btnEnterActiveStage: document.getElementById('btn-enter-active-stage'),

  // Quiz Screen
  quizProgressFill: document.getElementById('quiz-progress-fill'),
  quizStagePill: document.getElementById('quiz-stage-pill'),
  quizScorePill: document.getElementById('quiz-score-pill'),
  quizThemeIcon: document.getElementById('quiz-theme-icon'),
  quizStageName: document.getElementById('quiz-stage-name'),
  quizQuestionText: document.getElementById('quiz-question-text'),
  quizOptionsContainer: document.getElementById('quiz-options-container'),
  btnToggleHint: document.getElementById('btn-toggle-hint'),
  quizHintCard: document.getElementById('quiz-hint-card'),
  quizFeedbackCard: document.getElementById('quiz-feedback-card'),
  feedbackIcon: document.getElementById('feedback-icon'),
  feedbackHeadline: document.getElementById('feedback-headline'),
  feedbackPointsTag: document.getElementById('feedback-points-tag'),
  feedbackExplanation: document.getElementById('feedback-explanation'),
  btnNextStage: document.getElementById('btn-next-stage'),

  // Result Screen
  resultTrophy: document.getElementById('result-trophy'),
  resultPlayerGreeting: document.getElementById('result-player-greeting'),
  resultFinalScore: document.getElementById('result-final-score'),
  resultEvalHeadline: document.getElementById('result-eval-headline'),
  resultEvalMessage: document.getElementById('result-eval-message'),
  statCorrectCount: document.getElementById('stat-correct-count'),
  statAccuracy: document.getElementById('stat-accuracy'),
  statDuration: document.getElementById('stat-duration'),
  sheetsSyncCard: document.getElementById('sheets-sync-card'),
  sheetsSyncIcon: document.getElementById('sheets-sync-icon'),
  sheetsSyncTitle: document.getElementById('sheets-sync-title'),
  sheetsSyncDesc: document.getElementById('sheets-sync-desc'),
  btnOpenSheetsSetup: document.getElementById('btn-open-sheets-setup'),
  btnRestartGame: document.getElementById('btn-restart-game'),
  btnReviewAnswers: document.getElementById('btn-review-answers'),

  // Modals
  modalReview: document.getElementById('modal-review'),
  modalInfo: document.getElementById('modal-info'),
  modalSheets: document.getElementById('modal-sheets'),
  reviewListContainer: document.getElementById('review-list-container'),
  gasUrlInput: document.getElementById('gas-url-input'),
  gasTestResult: document.getElementById('gas-test-result'),
  btnTestSaveGas: document.getElementById('btn-test-save-gas')
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateSoundButtonUI();
  populateGasInput();
});

function setupEventListeners() {
  // Audio toggle
  dom.btnSoundToggle.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    updateSoundButtonUI();
    if (!isMuted) sound.playClick();
  });

  // Modals triggers
  dom.btnInfoModal.addEventListener('click', () => {
    sound.playClick();
    openModal('modal-info');
  });

  dom.btnSheetsModal.addEventListener('click', () => {
    sound.playClick();
    populateGasInput();
    openModal('modal-sheets');
  });

  dom.btnOpenSheetsSetup.addEventListener('click', () => {
    sound.playClick();
    populateGasInput();
    openModal('modal-sheets');
  });

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sound.playClick();
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close modal when clicking on backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // Avatar Selection
  dom.avatarSelector.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', () => {
      sound.playHop();
      dom.avatarSelector.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      state.avatar = option.getAttribute('data-avatar');
      
      // ถ้าช่องชื่อยังว่างอยู่ ให้แนะนำชื่อเริ่มต้น
      if (!dom.playerNickname.value.trim()) {
        dom.playerNickname.placeholder = `เช่น ${option.getAttribute('data-name')}`;
      }
    });
  });

  // Start Game Button
  dom.btnStartGame.addEventListener('click', handleStartGame);

  // Enter active stage button from map
  dom.btnEnterActiveStage.addEventListener('click', () => {
    sound.playClick();
    loadStage(state.currentStageIndex);
  });

  // Toggle Hint
  dom.btnToggleHint.addEventListener('click', () => {
    sound.playClick();
    dom.quizHintCard.classList.toggle('show');
  });

  // Next Stage Button
  dom.btnNextStage.addEventListener('click', handleNextStageClick);

  // Restart Game Button
  dom.btnRestartGame.addEventListener('click', handleRestartGame);

  // Review Answers Button
  dom.btnReviewAnswers.addEventListener('click', () => {
    sound.playClick();
    renderReviewModal();
    openModal('modal-review');
  });

  // Test & Save Google Apps Script URL
  dom.btnTestSaveGas.addEventListener('click', handleSaveAndTestGasUrl);
}

function updateSoundButtonUI() {
  dom.btnSoundToggle.innerHTML = sound.isMuted ? '🔇' : '🔊';
  dom.btnSoundToggle.setAttribute('title', sound.isMuted ? 'เปิดเสียง' : 'ปิดเสียง');
}

function populateGasInput() {
  const currentUrl = getGasWebAppUrl();
  dom.gasUrlInput.value = currentUrl;
  dom.gasTestResult.style.display = 'none';
}

// ==============================================================================
// NAVIGATION & SCREEN SWITCHING
// ==============================================================================
function showScreen(screenName) {
  state.currentScreen = screenName;
  Object.keys(dom.screens).forEach(key => {
    if (key === screenName) {
      dom.screens[key].classList.add('active');
    } else {
      dom.screens[key].classList.remove('active');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

// ==============================================================================
// GAME FLOW: START GAME
// ==============================================================================
function handleStartGame() {
  sound.playClick();
  const inputName = dom.playerNickname.value.trim();
  state.nickname = inputName || (state.avatar === 'boy' ? 'น้องกล้า' : 'น้องแก้ว');
  
  // รีเซ็ตตัวแปรเกม
  state.currentStageIndex = 0;
  state.unlockedStageIndex = 0;
  state.stageResults = [];
  state.totalScore = 0;
  state.startTime = new Date();
  state.endTime = null;

  // อัปเดตข้อมูลบนหน้าจอแผนที่
  dom.mapAvatarIcon.textContent = state.avatar === 'boy' ? '👦' : '👧';
  dom.mapPlayerName.textContent = state.nickname;
  dom.mapScoreDisplay.textContent = '0';

  renderMap();
  showScreen('map');
}

// ==============================================================================
// ADVENTURE MAP RENDERING
// ==============================================================================
function renderMap() {
  dom.mapStagesContainer.innerHTML = '<div class="map-path-line"></div>';

  GAME_CONFIG.STAGES.forEach((stage, index) => {
    const isCompleted = index < state.stageResults.length;
    const isActive = index === state.unlockedStageIndex;
    const isLocked = index > state.unlockedStageIndex;

    const item = document.createElement('div');
    item.className = `stage-node-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
    
    // ผลคะแนนด่านที่ผ่านมาแล้ว
    let resultText = '';
    if (isCompleted) {
      const res = state.stageResults[index];
      resultText = res.isCorrect ? '⭐ ผ่านแล้ว (+10 คะแนน)' : '⭕ ผ่านแล้ว (0 คะแนน)';
    } else if (isActive) {
      resultText = '📍 ด่านปัจจุบัน (พร้อมสำรวจ)';
    } else {
      resultText = '🔒 ยังไม่ปลดล็อก';
    }

    item.innerHTML = `
      <div class="stage-icon-circle">
        ${isCompleted ? '✅' : (isLocked ? '🔒' : stage.icon)}
      </div>
      <div class="stage-details">
        <div class="stage-node-number">ด่านที่ ${stage.stageNumber} จาก 5</div>
        <div class="stage-node-title">${stage.name.replace(/^ด่านที่ \d+:\s*/, '')}</div>
        <div class="stage-node-status ${isActive ? 'status-active' : (isCompleted ? 'status-completed' : 'status-locked')}">
          ${resultText}
        </div>
      </div>
      <div class="stage-action-arrow">➔</div>
    `;

    // ถ้าด่านนั้นปลดล็อกแล้ว สามารถคลิกเข้าไปทำได้
    if (!isLocked) {
      item.addEventListener('click', () => {
        sound.playClick();
        state.currentStageIndex = index;
        loadStage(index);
      });
    }

    dom.mapStagesContainer.appendChild(item);
  });

  // ปรับข้อความปุ่มเข้าด่าน
  dom.btnEnterActiveStage.innerHTML = `<span>🎯 เข้าสู่ด่านที่ ${state.unlockedStageIndex + 1}: ${GAME_CONFIG.STAGES[state.unlockedStageIndex].name.replace(/^ด่านที่ \d+:\s*/, '')}</span>`;
}

// ==============================================================================
// QUIZ STAGE LOGIC
// ==============================================================================
function loadStage(stageIndex) {
  state.currentStageIndex = stageIndex;
  state.hasAnsweredCurrentStage = false;
  const stage = GAME_CONFIG.STAGES[stageIndex];

  // อัปเดตส่วนหัวของด่าน
  dom.quizStagePill.textContent = `ด่านที่ ${stage.stageNumber} จาก 5`;
  dom.quizScorePill.textContent = state.totalScore;
  dom.quizProgressFill.style.width = `${((stageIndex + 1) / GAME_CONFIG.TOTAL_QUESTIONS) * 100}%`;

  dom.quizThemeIcon.textContent = stage.icon;
  dom.quizStageName.textContent = stage.name;
  dom.quizQuestionText.textContent = stage.question;

  // รีเซ็ตการ์ดคำใบ้
  dom.quizHintCard.classList.remove('show');
  dom.quizHintCard.innerHTML = `💡 <strong>คำใบ้จากนักสำรวจ:</strong> ${stage.hint}`;

  // ซ่อนการ์ดเฉลย
  dom.quizFeedbackCard.classList.remove('show', 'is-correct', 'is-wrong');

  // สร้าง 4 ตัวเลือก (ก. ข. ค. ง.)
  renderOptions(stage);

  showScreen('quiz');
}

function renderOptions(stage) {
  dom.quizOptionsContainer.innerHTML = '';
  const thaiPrefixes = ['ก.', 'ข.', 'ค.', 'ง.'];

  stage.options.forEach((optionText, optIndex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-prefix">${thaiPrefixes[optIndex]}</span>
      <span class="option-label">${optionText}</span>
    `;

    btn.addEventListener('click', () => {
      if (!state.hasAnsweredCurrentStage) {
        handleOptionSelect(stage, optIndex);
      }
    });

    dom.quizOptionsContainer.appendChild(btn);
  });
}

function handleOptionSelect(stage, chosenIndex) {
  state.hasAnsweredCurrentStage = true;
  const isCorrect = (chosenIndex === stage.correctIndex);
  const earnedPoints = isCorrect ? GAME_CONFIG.POINTS_PER_QUESTION : 0;
  
  // บันทึกคะแนน
  state.totalScore += earnedPoints;
  dom.quizScorePill.textContent = state.totalScore;

  // บันทึกผลลัพธ์ด่านนี้
  state.stageResults[state.currentStageIndex] = {
    stageId: stage.id,
    stageName: stage.name,
    question: stage.question,
    chosenIndex: chosenIndex,
    chosenText: stage.options[chosenIndex],
    correctIndex: stage.correctIndex,
    correctText: stage.options[stage.correctIndex],
    isCorrect: isCorrect,
    points: earnedPoints,
    explanation: stage.explanation,
    timestamp: new Date().toISOString()
  };

  // เล่นเสียงตามผลลัพธ์
  if (isCorrect) {
    sound.playCorrect();
    triggerMiniSparkles();
  } else {
    sound.playWrong();
  }

  // ไฮไลต์ปุ่มตัวเลือก
  const optionButtons = dom.quizOptionsContainer.querySelectorAll('.option-btn');
  optionButtons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === stage.correctIndex) {
      btn.classList.add('correct');
    }
    if (idx === chosenIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // แสดงการ์ดผลลัพธ์และคำอธิบาย
  showFeedbackCard(isCorrect, earnedPoints, stage);
}

function showFeedbackCard(isCorrect, earnedPoints, stage) {
  dom.quizFeedbackCard.className = `answer-feedback-card show ${isCorrect ? 'is-correct' : 'is-wrong'}`;
  
  dom.feedbackIcon.textContent = isCorrect ? '🎉' : '💡';
  dom.feedbackHeadline.textContent = isCorrect ? 'ถูกต้องยอดเยี่ยม!' : 'ยังไม่ถูกต้องนะ!';
  dom.feedbackPointsTag.textContent = isCorrect ? `+${earnedPoints} คะแนน` : '0 คะแนน';
  
  dom.feedbackExplanation.innerHTML = `
    <div style="margin-bottom: 6px;">
      <strong>เฉลย:</strong> ${stage.options[stage.correctIndex]}
    </div>
    <div>${stage.explanation}</div>
  `;

  // อัปเดตปุ่มถัดไป
  if (state.currentStageIndex >= GAME_CONFIG.TOTAL_QUESTIONS - 1) {
    dom.btnNextStage.innerHTML = '<span>🏆 ดูสรุปคะแนนสุดท้าย</span>';
  } else {
    dom.btnNextStage.innerHTML = '<span>🚀 เดินทางต่อสู่ด่านถัดไป</span>';
  }
}

function handleNextStageClick() {
  sound.playClick();
  
  // ปลดล็อกด่านถัดไป
  if (state.unlockedStageIndex <= state.currentStageIndex) {
    state.unlockedStageIndex = state.currentStageIndex + 1;
  }

  // หากเล่นครบ 5 ด่านแล้ว ให้แสดงหน้าผลคะแนน
  if (state.currentStageIndex >= GAME_CONFIG.TOTAL_QUESTIONS - 1) {
    finishGame();
  } else {
    // ข้ามไปด่านถัดไป
    state.currentStageIndex++;
    loadStage(state.currentStageIndex);
  }
}

// ==============================================================================
// GAME OVER & RESULTS
// ==============================================================================
function finishGame() {
  state.endTime = new Date();
  showScreen('result');

  // คำนวณสถิติ
  const totalCorrect = state.stageResults.filter(r => r.isCorrect).length;
  const accuracy = Math.round((totalCorrect / GAME_CONFIG.TOTAL_QUESTIONS) * 100);
  
  const playDurationMs = state.endTime - (state.startTime || state.endTime);
  const minutes = Math.floor(playDurationMs / 60000);
  const seconds = Math.floor((playDurationMs % 60000) / 1000);
  const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // แสดงข้อมูลผู้เล่นและคะแนน
  dom.resultPlayerGreeting.textContent = `ยอดเยี่ยมมาก! ${state.nickname} (นักสืบประวัติศาสตร์ ป.4)`;
  dom.resultFinalScore.textContent = state.totalScore;
  dom.statCorrectCount.textContent = `${totalCorrect} / ${GAME_CONFIG.TOTAL_QUESTIONS}`;
  dom.statAccuracy.textContent = `${accuracy}%`;
  dom.statDuration.textContent = durationStr;

  // ประเมินผลตามเกณฑ์คะแนน
  const evalItem = GAME_CONFIG.EVALUATIONS.find(e => state.totalScore >= e.minScore) || GAME_CONFIG.EVALUATIONS[GAME_CONFIG.EVALUATIONS.length - 1];
  dom.resultEvalHeadline.textContent = evalItem.title;
  dom.resultEvalMessage.textContent = evalItem.message;

  // เสียงและเอฟเฟกต์ฉลอง
  if (state.totalScore >= 40) {
    sound.playVictory();
    startConfetti(4000);
  } else {
    sound.playUnlock();
  }

  // จัดการการส่งข้อมูล Google Sheets
  processGoogleSheetsSubmission({
    nickname: state.nickname,
    score: state.totalScore,
    correctCount: totalCorrect,
    totalQuestions: GAME_CONFIG.TOTAL_QUESTIONS,
    maxScore: GAME_CONFIG.MAX_SCORE,
    evaluation: evalItem.title,
    playDuration: durationStr
  });
}

// ==============================================================================
// GOOGLE SHEETS INTEGRATION
// ตามข้อกำหนด: "หากยังไม่ได้ตั้งค่า Google Apps Script ให้แสดงวิธีเชื่อมต่ออย่างชัดเจน ห้ามจำลองว่าบันทึกข้อมูลสำเร็จแล้ว"
// ==============================================================================
function processGoogleSheetsSubmission(gameData) {
  const gasUrl = getGasWebAppUrl();

  // 1. กรณีที่ยังไม่ได้ตั้งค่า Google Apps Script URL
  if (!gasUrl || gasUrl.trim().length === 0) {
    dom.sheetsSyncCard.className = 'sheets-sync-card status-not-configured';
    dom.sheetsSyncIcon.textContent = '⚠️';
    dom.sheetsSyncTitle.textContent = 'สถานะ Google Sheets: ยังไม่ได้เชื่อมต่อ Web App';
    dom.sheetsSyncDesc.innerHTML = `
      ยังไม่ได้บันทึกคะแนนลง Google Sheets เนื่องจากยังไม่ได้ระบุ Web App URL<br>
      (ระบบจะไม่จำลองว่าบันทึกสำเร็จ เพื่อความถูกต้องของการเก็บคะแนนจริงของนักเรียน)
    `;
    dom.btnOpenSheetsSetup.style.display = 'inline-flex';
    return;
  }

  // 2. กรณีที่มีการตั้งค่า URL ไว้แล้ว -> ทำการส่งข้อมูลจริง
  dom.sheetsSyncCard.className = 'sheets-sync-card status-saving';
  dom.sheetsSyncIcon.textContent = '⏳';
  dom.sheetsSyncTitle.textContent = 'สถานะ Google Sheets: กำลังบันทึกข้อมูล...';
  dom.sheetsSyncDesc.textContent = `กำลังเชื่อมต่อกับ Google Sheet ID: ${GAME_CONFIG.SPREADSHEET_ID}...`;
  dom.btnOpenSheetsSetup.style.display = 'none';

  const payload = {
    timestamp: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
    nickname: gameData.nickname,
    score: gameData.score,
    correctCount: gameData.correctCount,
    totalQuestions: gameData.totalQuestions,
    maxScore: gameData.maxScore,
    evaluation: gameData.evaluation,
    playDuration: gameData.playDuration,
    userAgent: navigator.userAgent
  };

  // ส่งคำขอแบบ POST (Content-Type: text/plain หลีกเลี่ยง CORS preflight options ปัญหาของ GAS)
  fetch(gasUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }
    return response.json();
  })
  .then(result => {
    if (result && result.status === 'success') {
      dom.sheetsSyncCard.className = 'sheets-sync-card status-success';
      dom.sheetsSyncIcon.textContent = '✅';
      dom.sheetsSyncTitle.textContent = 'สถานะ Google Sheets: บันทึกข้อมูลสำเร็จเรียบร้อย!';
      dom.sheetsSyncDesc.innerHTML = `
        บันทึกผลคะแนนของ <strong>${escapeHtml(gameData.nickname)}</strong> (${gameData.score} คะแนน) ลงใน Sheet เรียบร้อยแล้ว ณ แถวที่ ${result.rowNumber || 'ล่าสุด'}
      `;
      dom.btnOpenSheetsSetup.style.display = 'inline-flex';
      dom.btnOpenSheetsSetup.textContent = '⚙️ ตรวจสอบการตั้งค่า';
    } else {
      throw new Error(result.message || 'การตอบกลับจาก Google Apps Script แจ้งข้อผิดพลาด');
    }
  })
  .catch(err => {
    // ในกรณีที่ Fetch ติดปัญหา no-cors redirect ของ Google Apps Script (ซึ่ง Google มักทำ 302 redirect ไปยัง googleusercontent)
    // เราจะแจ้งสถานะตามความเป็นจริง ไม่หลอกผู้ใช้
    console.error('GAS Submission Error:', err);
    dom.sheetsSyncCard.className = 'sheets-sync-card status-error';
    dom.sheetsSyncIcon.textContent = '❌';
    dom.sheetsSyncTitle.textContent = 'สถานะ Google Sheets: ไม่สามารถส่งข้อมูลได้';
    dom.sheetsSyncDesc.innerHTML = `
      เกิดข้อผิดพลาดในการเชื่อมต่อ: <code>${escapeHtml(err.message)}</code><br>
      กรุณาตรวจสอบว่าได้ตั้งค่าสิทธิ์ของ Web App เป็น <strong>"ทุกคน (Anyone)"</strong> หรือยัง
    `;
    dom.btnOpenSheetsSetup.style.display = 'inline-flex';
    dom.btnOpenSheetsSetup.textContent = '⚙️ แก้ไขหรือทดสอบ URL';
  });
}

// ทดสอบและบันทึก URL ใน Modal ตั้งค่า
function handleSaveAndTestGasUrl() {
  sound.playClick();
  const inputUrl = dom.gasUrlInput.value.trim();
  
  if (!inputUrl) {
    saveGasWebAppUrl('');
    dom.gasTestResult.style.display = 'block';
    dom.gasTestResult.style.color = '#B45309';
    dom.gasTestResult.innerHTML = '⚠️ ล้างค่า URL เรียบร้อยแล้ว (ระบบจะกลับสู่สถานะยังไม่เชื่อมต่อ)';
    return;
  }

  if (!inputUrl.startsWith('https://script.google.com/')) {
    dom.gasTestResult.style.display = 'block';
    dom.gasTestResult.style.color = '#DC2626';
    dom.gasTestResult.innerHTML = '❌ รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย <code>https://script.google.com/</code>';
    return;
  }

  dom.gasTestResult.style.display = 'block';
  dom.gasTestResult.style.color = '#1E40AF';
  dom.gasTestResult.innerHTML = '⏳ กำลังทดสอบส่งสัญญาณไปยัง Google Apps Script...';

  // ทดสอบเรียก GET request
  fetch(inputUrl, { method: 'GET', mode: 'cors' })
    .then(res => res.json())
    .then(data => {
      saveGasWebAppUrl(inputUrl);
      dom.gasTestResult.style.color = '#059669';
      dom.gasTestResult.innerHTML = `✅ เชื่อมต่อสำเร็จ! Google Apps Script พร้อมทำงาน (${data.message || 'Online'})`;
    })
    .catch(err => {
      // แม้บางกรณี CORS GET จะถูกบล็อคโดยเบราว์เซอร์ แต่ URL อาจถูกต้อง
      saveGasWebAppUrl(inputUrl);
      dom.gasTestResult.style.color = '#D97706';
      dom.gasTestResult.innerHTML = `
        💾 บันทึก URL แล้ว! (หมายเหตุ: ตรวจสอบให้แน่ใจว่าได้เลือกสิทธิ์ Who has access เป็น <strong>Anyone</strong> แล้วในการ Deploy)
      `;
    });
}

// ==============================================================================
// RESTART & REVIEW MODAL
// ==============================================================================
function handleRestartGame() {
  sound.playClick();
  showScreen('welcome');
}

function renderReviewModal() {
  dom.reviewListContainer.innerHTML = '';

  GAME_CONFIG.STAGES.forEach((stage, idx) => {
    const res = state.stageResults[idx];
    const card = document.createElement('div');
    const isCorrect = res ? res.isCorrect : false;
    
    card.className = `review-item-card ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    card.innerHTML = `
      <div class="review-card-head">
        <span class="review-question-num">ด่านที่ ${stage.stageNumber}: ${stage.name.replace(/^ด่านที่ \d+:\s*/, '')}</span>
        <span class="review-ans-status">${isCorrect ? '✅ ถูกต้อง (+10)' : '❌ ผิด (0)'}</span>
      </div>
      <div class="review-q-text">${stage.question}</div>
      <div class="review-answers-box">
        <div class="review-user-ans">
          <strong>คำตอบของคุณ:</strong> ${res ? escapeHtml(res.chosenText) : 'ไม่ได้ตอบ'}
        </div>
        <div class="review-correct-ans">
          <strong>คำตอบที่ถูกต้อง:</strong> ${escapeHtml(stage.options[stage.correctIndex])}
        </div>
      </div>
      <div class="review-expl">
        <strong>คำอธิบาย:</strong> ${stage.explanation}
      </div>
    `;

    dom.reviewListContainer.appendChild(card);
  });
}

// ==============================================================================
// VISUAL EFFECTS: CONFETTI & SPARKLES
// ==============================================================================
function triggerMiniSparkles() {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.textContent = '✨';
  sparkle.style.top = '50%';
  sparkle.style.left = '50%';
  sparkle.style.position = 'fixed';
  sparkle.style.fontSize = '3rem';
  sparkle.style.zIndex = '999';
  sparkle.style.pointerEvents = 'none';
  sparkle.style.animation = 'pulseSparkle 0.8s ease-out forwards';
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 800);
}

function startConfetti(durationMs = 3500) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    if (Date.now() - startTime < durationMs) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  animate();
}

// Utility: XSS Protection for text insertion
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
