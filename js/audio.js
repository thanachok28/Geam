/**
 * ==============================================================================
 * โครงการ: นักผจญภัยตามล่าหลักฐานทางประวัติศาสตร์ (Grade 4 History Adventure)
 * ไฟล์: audio.js (ระบบเสียงสังเคราะห์ Web Audio API สำหรับเกมเด็ก)
 * ==============================================================================
 */

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('HISTORY_GAME_MUTED') === 'true';
  }

  // เริ่มต้น AudioContext เมื่อมีการโต้ตอบครั้งแรก (ตามนโยบายเบราว์เซอร์)
  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('HISTORY_GAME_MUTED', this.isMuted.toString());
    return this.isMuted;
  }

  // เสียงคลิกปุ่มทั่วไป (Pop/Click น่ารัก ๆ)
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // เสียงเลือกตัวละคร / ย้ายด่าน (Jump/Hop)
  playHop() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // เสียงเมื่อตอบคำถามถูกต้อง (Bright Chord Chime)
  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      const startTime = now + idx * 0.08;
      const duration = 0.28;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // เสียงเมื่อตอบผิด (Soft playful bonk, ไม่ทำให้เด็กเสียใจ)
  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // เสียงเปิดหีบสมบัติ / ปลดล็อกด่านใหม่ (Triumph Fanfare)
  playUnlock() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      const st = now + i * 0.09;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(st);
      osc.stop(st + 0.35);
    });
  }

  // เสียงฉลองจบเกม (Victory Fanfare)
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.35 }, // E5
      { f: 783.99, d: 0.25 }, // G5
      { f: 1046.50, d: 0.6 }  // C6
    ];

    let current = this.audioCtx.currentTime;
    melody.forEach((note) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, current);
      gain.gain.setValueAtTime(0.25, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + note.d);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(current);
      osc.stop(current + note.d);

      current += note.d * 0.9;
    });
  }
}

// สร้าง Instance เสียงกลางสำหรับทั้งระบบ
const sound = new SoundManager();
