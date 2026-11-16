// js/game.js - Classroom-ready version with accurate scoring and Google Sheets submission

const POINTS_PER_QUESTION = 100 / 18; // 18 challenges total

let studentData = {
  name: '',
  period: '1',
  character: { skin: 0xFFDBAC },
  progress: { 
    completedMissions: [], 
    notebook: [],
    answers: {},          // qid -> { attempts, correct, points, firstAttemptCorrect }
    missionScores: {},    // missionId -> points earned
    totalIncorrect: 0,
    submissionId: null,
    submitted: false
  },
  finalScore: 0
};

let game;
let currentDialog = null;
let currentQuestionContext = null; // holds open question so we can restore after help

const SAVE_KEY = 'findingMrGomez_progress';

function saveProgress() {
  try {
    const data = {
      name: studentData.name,
      period: studentData.period,
      character: studentData.character,
      progress: studentData.progress,
      finalScore: studentData.finalScore,
      savedAt: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save progress', e);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearProgress() {
  localStorage.removeItem(SAVE_KEY);
}

function startGame() {
  const name = document.getElementById('studentName').value.trim();
  if (!name) {
    alert('Please enter your full name.');
    return;
  }

  const saved = loadProgress();
  if (saved && saved.name === name && saved.period === document.getElementById('period').value) {
    if (confirm('You have saved progress. Continue where you left off?')) {
      studentData = saved;
      document.getElementById('menu').style.display = 'none';
      document.getElementById('game-container').style.display = 'block';
      initGame();
      return;
    }
  }

  studentData.name = name;
  studentData.period = document.getElementById('period').value;
  studentData.character.skin = parseInt(document.getElementById('skin').value);
  studentData.progress.submissionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  studentData.progress.submitted = false;
  saveProgress();

  document.getElementById('menu').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  initGame();
}

function initGame() {
  const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 650,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [SchoolScene],
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
  };
  game = new Phaser.Game(config);
}

function calculateFinalScore() {
  let total = 0;
  Object.values(studentData.progress.answers).forEach(a => {
    if (a.correct && typeof a.points === 'number') total += a.points;
  });
  return Math.round(total * 10) / 10; // one decimal max, still on 100 scale
}

async function submitResults() {
  if (studentData.progress.submitted) return { success: true, already: true };
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    return { success: false, error: 'Apps Script URL not configured' };
  }

  studentData.finalScore = calculateFinalScore();
  saveProgress();

  const payload = {
    submissionId: studentData.progress.submissionId,
    name: studentData.name,
    period: studentData.period,
    finalScore: studentData.finalScore,
    missionScores: studentData.progress.missionScores,
    answers: studentData.progress.answers,
    completedMissions: studentData.progress.completedMissions,
    totalIncorrect: studentData.progress.totalIncorrect,
    completionStatus: studentData.progress.completedMissions.length === 6 ? 'Complete' : 'Incomplete'
  };

  try {
    // Use text/plain to avoid CORS preflight issues common with GitHub Pages → Apps Script
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { success: false, error: 'Bad response' }; }
    if (json.success) {
      studentData.progress.submitted = true;
      saveProgress();
      return { success: true, already: !!json.already };
    }
    return { success: false, error: json.error || 'Server rejected save' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
}

class SchoolScene extends Phaser.Scene {
  constructor() { super({ key: 'SchoolScene' }); }

  preload() {
    this.load.image('hallway', 'assets/hallway.jpg');
    this.load.image('mrgomez', 'assets/mr_gomez.jpg');
    // Load walking sprite sheets (approximate 4 frames each)
    this.load.spritesheet('walk_down', 'assets/player_walk_down.jpg', { frameWidth: 290, frameHeight: 400 });
    this.load.spritesheet('walk_up', 'assets/player_walk_up.jpg', { frameWidth: 290, frameHeight: 400 });
    this.load.spritesheet('walk_right', 'assets/player_walk_right.jpg', { frameWidth: 290, frameHeight: 400 });
  }

  create() {
    // Background
    this.add.image(450, 325, 'hallway').setDisplaySize(900, 650).setAlpha(0.6);

    // Room buttons (clickable areas over the hallway)
    this.rooms = {
      room128: { x: 120, y: 140, label: 'Room 128', unlocked: true, color: 0xe74c3c },
      nurse: { x: 280, y: 140, label: 'Nurse', unlocked: true, color: 0x27ae60 },
      library: { x: 440, y: 140, label: 'Library', unlocked: false, color: 0x8e44ad },
      cafeteria: { x: 600, y: 140, label: 'Cafeteria', unlocked: false, color: 0xf39c12 },
      office: { x: 120, y: 320, label: 'Office', unlocked: false, color: 0x2980b9 },
      counseling: { x: 280, y: 320, label: 'Counseling', unlocked: false, color: 0x16a085 },
      lounge: { x: 440, y: 320, label: 'Lounge', unlocked: false, color: 0xd35400 },
      room127: { x: 600, y: 320, label: 'Room 127', unlocked: false, color: 0xc0392b }
    };

    this.roomButtons = {};
    Object.keys(this.rooms).forEach(key => {
      const r = this.rooms[key];
      const btn = this.add.rectangle(r.x, r.y, 110, 70, r.color, 0.85)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xffffff);
      this.add.text(r.x, r.y, r.label, { fontSize: '13px', color: '#fff', align: 'center' }).setOrigin(0.5);
      btn.on('pointerdown', () => this.enterRoom(key));
      this.roomButtons[key] = btn;
    });

    // Create animations
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('walk_down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('walk_up', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('walk_right', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('walk_right', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'walk_down', frame: 0 }],
      frameRate: 1,
      repeat: -1
    });

    // Player sprite with animations + skin tint
    this.player = this.physics.add.sprite(450, 520, 'walk_down', 0);
    this.player.setDisplaySize(48, 64);
    this.player.body.setCollideWorldBounds(true);
    this.player.setFlipX(false);
    if (studentData.character && studentData.character.skin) {
      this.player.setTint(studentData.character.skin);
    }

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    this.input.keyboard.on('keydown-N', () => {
      if (!currentDialog) this.toggleNotebook();
    });
    // Escape no longer closes unanswered questions
    this.input.keyboard.on('keydown-ESC', () => {
      // Only allow closing non-blocking messages if needed; questions stay open
      if (currentDialog && !currentQuestionContext) {
        this.closeDialog();
      }
    });

    this.statusText = this.add.text(20, 610, 'Click a room or walk around. Press N for Notebook.', {
      fontSize: '16px', color: '#ffd700', backgroundColor: '#000000aa', padding: { x: 8, y: 4 }
    });

    this.notebookOpen = false;

    // Restore unlocked rooms from saved progress
    studentData.progress.completedMissions.forEach(mid => {
      const m = MISSIONS.find(x => x.id === mid);
      if (m && this.rooms[m.next]) this.rooms[m.next].unlocked = true;
    });
    if (studentData.progress.completedMissions.length >= 6 && this.rooms.room127) {
      this.rooms.room127.unlocked = true;
    }
  }

  update() {
    if (currentDialog) {
      this.player.setVelocity(0);
      this.player.anims.stop();
      return;
    }
    const speed = 180;
    let moving = false;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk-right', true);
      this.player.setFlipX(false);
      moving = true;
    } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('walk-up', true);
      this.player.setFlipX(false);
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('walk-down', true);
      this.player.setFlipX(false);
      moving = true;
    }

    if (!moving) {
      this.player.anims.play('idle', true);
      this.player.setFlipX(false);
    }
  }

  enterRoom(roomKey) {
    const room = this.rooms[roomKey];
    if (!room.unlocked) {
      this.showMessage('Hmm… This door is locked.\nMaybe we should check a different place.');
      return;
    }

    const mission = MISSIONS.find(m => m.room === roomKey);
    if (mission && !studentData.progress.completedMissions.includes(mission.id)) {
      this.startMission(mission);
    } else if (roomKey === 'room127' && studentData.progress.completedMissions.length >= 6) {
      this.showEnding();
    } else {
      this.showMessage(`You are in ${room.label}.\nLook around for clues.`);
    }
  }

  startMission(mission) {
    const questions = QUESTIONS[mission.id];
    if (!questions) return;
    this.currentMission = mission;
    this.currentQuestionIndex = 0;
    this.missionAnswers = [];
    this.showQuestion(questions[0], mission);
  }

  showQuestion(q, mission) {
    this.closeDialog();
    currentQuestionContext = { q, mission };
    const container = this.add.container(450, 320).setDepth(100);
    const bg = this.add.rectangle(0, 0, 700, 440, 0x000000, 0.94).setStrokeStyle(4, 0xffd700);
    const title = this.add.text(0, -180, mission.name + ' Challenge', { fontSize: '22px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
    const prompt = this.add.text(0, -110, q.prompt, { fontSize: '18px', color: '#ffffff', wordWrap: { width: 620 }, align: 'center' }).setOrigin(0.5);
    
    container.add([bg, title, prompt]);

    q.options.forEach((opt, i) => {
      const btn = this.add.rectangle(0, -40 + i * 68, 520, 52, 0x2c3e50)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xffffff);
      const txt = this.add.text(0, -40 + i * 68, opt, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
      btn.on('pointerdown', () => this.answerQuestion(i, q, mission));
      container.add([btn, txt]);
    });

    // Spanish help - does not close the question permanently
    const helpBtn = this.add.rectangle(0, 175, 200, 40, 0x3498db).setInteractive({ useHandCursor: true });
    const helpTxt = this.add.text(0, 175, 'Spanish Help', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    helpBtn.on('pointerdown', () => {
      this.showMessage(q.spanish || 'No Spanish help available.', () => {
        if (currentQuestionContext) this.showQuestion(currentQuestionContext.q, currentQuestionContext.mission);
      });
    });
    container.add([helpBtn, helpTxt]);

    currentDialog = container;
  }

  answerQuestion(selected, q, mission) {
    // Initialize record if needed
    if (!studentData.progress.answers[q.id]) {
      studentData.progress.answers[q.id] = { attempts: 0, correct: false, points: 0, firstAttemptCorrect: false };
    }
    const record = studentData.progress.answers[q.id];

    // Already solved — do not change score
    if (record.correct) {
      this.showFeedback(true, `Already completed.\nPoints earned: ${record.points.toFixed(1)}`, () => {
        this.advanceAfterQuestion(mission);
      });
      return;
    }

    record.attempts += 1;
    const correct = selected === q.correct;

    if (correct) {
      record.correct = true;
      record.firstAttemptCorrect = record.attempts === 1;
      record.points = record.attempts === 1 ? POINTS_PER_QUESTION : POINTS_PER_QUESTION * 0.8;
      saveProgress();
      const earned = record.points.toFixed(1);
      const msg = `Correct!\n\n${q.feedback}\n\nPoints earned: ${earned}`;
      this.showFeedback(true, msg, () => this.advanceAfterQuestion(mission));
    } else {
      studentData.progress.totalIncorrect += 1;
      saveProgress();
      this.showFeedback(false, 'Try Again!\n\nSubsequent attempts earn a maximum of 80% credit.\nYou can keep trying.', () => {
        this.showQuestion(q, mission);
      });
    }
  }

  advanceAfterQuestion(mission) {
    this.currentQuestionIndex++;
    const questions = QUESTIONS[mission.id];
    if (this.currentQuestionIndex < questions.length) {
      this.showQuestion(questions[this.currentQuestionIndex], mission);
    } else {
      this.completeMission(mission);
    }
  }

  completeMission(mission) {
    // Calculate mission score from its questions only
    const questions = QUESTIONS[mission.id] || [];
    let missionPoints = 0;
    questions.forEach(q => {
      const a = studentData.progress.answers[q.id];
      if (a && a.correct) missionPoints += a.points;
    });
    studentData.progress.missionScores[mission.id] = Math.round(missionPoints * 10) / 10;

    if (!studentData.progress.completedMissions.includes(mission.id)) {
      studentData.progress.completedMissions.push(mission.id);
      studentData.progress.notebook.push(mission.clue);
    }
    if (this.rooms[mission.next]) this.rooms[mission.next].unlocked = true;
    saveProgress();

    const scoreText = `Mission score: ${studentData.progress.missionScores[mission.id]} points`;
    this.showMessage(`Mission Complete!\n\n${scoreText}\n\nClue: ${mission.clue}\n\nYou received a key.`, () => {
      if (studentData.progress.completedMissions.length === 6) {
        this.rooms.room127.unlocked = true;
        this.statusText.setText('All missions done! Go to Room 127!');
      }
    });
  }

  showEnding() {
    this.closeDialog();
    const container = this.add.container(450, 300).setDepth(120);
    const bg = this.add.rectangle(0, 0, 750, 480, 0x000000, 0.95).setStrokeStyle(6, 0xffd700);
    const img = this.add.image(0, -140, 'mrgomez').setDisplaySize(120, 160);
    const text = this.add.text(0, 20, 'Mr. Gomez! We found you!\n\nOh! What time is it?\nDid I miss my class?\n\nMISSION COMPLETE!\nYOU FOUND MR. GOMEZ!', {
      fontSize: '22px', color: '#fff', align: 'center', wordWrap: { width: 680 }
    }).setOrigin(0.5);
    container.add([bg, img, text]);

    // Final question
    setTimeout(() => {
      this.showFinalQuestion();
    }, 2000);
    currentDialog = container;
  }

  showFinalQuestion() {
    this.closeDialog();
    const container = this.add.container(450, 320).setDepth(130);
    const bg = this.add.rectangle(0, 0, 680, 380, 0x1a1a2e, 0.97).setStrokeStyle(4, 0xffd700);
    const q = this.add.text(0, -140, 'Where was Mr. Gomez?', { fontSize: '24px', color: '#ffd700' }).setOrigin(0.5);
    container.add([bg, q]);

    const options = ['In the cafeteria.', 'In the library.', 'In Room 127.'];
    options.forEach((opt, i) => {
      const btn = this.add.rectangle(0, -40 + i * 70, 480, 55, 0x2c3e50).setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, -40 + i * 70, opt, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        if (i === 2) {
          studentData.finalScore = calculateFinalScore();
          this.showVictory();
        } else {
          this.showMessage('Try again. Think about the last clue.', () => this.showFinalQuestion());
        }
      });
      container.add([btn, txt]);
    });
    currentDialog = container;
  }

  async showVictory() {
    this.closeDialog();
    studentData.finalScore = calculateFinalScore();

    const container = this.add.container(450, 300).setDepth(140);
    const bg = this.add.rectangle(0, 0, 720, 460, 0x0a3d0a, 0.96).setStrokeStyle(6, 0xffd700);
    const title = this.add.text(0, -160, 'ENGLISH DETECTIVE MEDAL', { fontSize: '26px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
    const score = this.add.text(0, -70, `${studentData.name}\nFinal Score: ${studentData.finalScore}/100`, { fontSize: '22px', color: '#fff', align: 'center' }).setOrigin(0.5);
    const medal = this.add.text(0, 20, '🏅', { fontSize: '70px' }).setOrigin(0.5);
    const status = this.add.text(0, 100, 'Saving results...', { fontSize: '16px', color: '#ffd700' }).setOrigin(0.5);

    const playBtn = this.add.rectangle(0, 170, 200, 48, 0xffffff).setInteractive({ useHandCursor: true });
    const playTxt = this.add.text(0, 170, 'Play Again', { fontSize: '18px', color: '#000' }).setOrigin(0.5);
    playBtn.on('pointerdown', () => location.reload());

    container.add([bg, title, score, medal, status, playBtn, playTxt]);
    currentDialog = container;

    const result = await submitResults();
    if (result.success) {
      status.setText(result.already ? 'Results already saved.' : 'Results saved to teacher.');
    } else {
      status.setText('Could not save. Click Retry.');
      const retryBtn = this.add.rectangle(220, 170, 160, 48, 0xf39c12).setInteractive({ useHandCursor: true });
      const retryTxt = this.add.text(220, 170, 'Retry Save', { fontSize: '16px', color: '#000' }).setOrigin(0.5);
      retryBtn.on('pointerdown', async () => {
        status.setText('Saving...');
        const r2 = await submitResults();
        status.setText(r2.success ? 'Results saved!' : 'Still failed. Try again later.');
        if (r2.success) { retryBtn.destroy(); retryTxt.destroy(); }
      });
      container.add([retryBtn, retryTxt]);
    }
  }

  showMessage(text, onClose) {
    this.closeDialog();
    const container = this.add.container(450, 320).setDepth(100);
    const bg = this.add.rectangle(0, 0, 620, 280, 0x000000, 0.93).setStrokeStyle(4, 0x3498db);
    const msg = this.add.text(0, -40, text, { fontSize: '20px', color: '#fff', wordWrap: { width: 560 }, align: 'center' }).setOrigin(0.5);
    const btn = this.add.rectangle(0, 90, 160, 50, 0xffffff).setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(0, 90, 'OK', { fontSize: '18px', color: '#000' }).setOrigin(0.5);
    btn.on('pointerdown', () => { this.closeDialog(); if (onClose) onClose(); });
    container.add([bg, msg, btn, btnTxt]);
    currentDialog = container;
  }

  closeDialog() {
    if (currentDialog) {
      currentDialog.destroy();
      currentDialog = null;
    }
  }

  toggleNotebook() {
    // Simple notebook overlay
    this.showMessage(
      `Detective Notebook\n\nStudent: ${studentData.name}\nMissions: ${studentData.progress.completedMissions.length}/6\n\nClues:\n${studentData.progress.notebook.join('\n') || 'None yet.'}`
    );
  }
}
