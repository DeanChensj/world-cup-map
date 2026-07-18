// --- Tactical Web Audio Synthesizer Engine ---
class TacticalAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playAlert() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    [110, 165, 220].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.6);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  playChime(isPlay) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = isPlay ? 440 : 880;
    const endFreq = isPlay ? 880 : 440;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

const audio = new TacticalAudio();

function toggleAudio() {
  audio.muted = !audio.muted;
  const btn = document.getElementById("btn-audio-toggle");
  const updateEl = (id, callback) => {
    const el = document.getElementById(id);
    if (el) callback(el);
  };
  
  if (audio.muted) {
    if (btn) {
      btn.classList.add("text-console-dimText");
      btn.classList.remove("text-console-accent");
    }
    updateEl("audio-icon", e => e.className = "ph-bold ph-speaker-slash text-[10px]");
    updateEl("audio-label", e => e.innerText = "SFX: OFF");
    updateEl("legend-audio-icon", e => e.className = "ph-bold ph-speaker-slash text-xs text-console-dimText");
  } else {
    if (btn) {
      btn.classList.remove("text-console-dimText");
      btn.classList.add("text-console-accent");
    }
    updateEl("audio-icon", e => e.className = "ph-bold ph-speaker-high text-[10px]");
    updateEl("audio-label", e => e.innerText = "SFX: ON");
    updateEl("legend-audio-icon", e => e.className = "ph-bold ph-speaker-high text-xs text-console-accent");
  }
}
