// --- Tactical Web Audio Synthesizer Engine (V2 Modernized) ---
class TacticalAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    
    // Load persisted settings or default
    const savedMuted = localStorage.getItem("worldcup_sfx_muted");
    const savedVol = localStorage.getItem("worldcup_sfx_volume");
    
    this.muted = savedMuted === "true";
    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.7;
    if (isNaN(this.volume)) this.volume = 0.7;
    
    this.noiseBuffer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Dynamics Compressor to prevent clipping & harshness
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem("worldcup_sfx_volume", this.volume.toString());
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, now);
    }
    updateAudioUI();
  }

  setMuted(isMuted) {
    this.muted = !!isMuted;
    localStorage.setItem("worldcup_sfx_muted", this.muted.toString());
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, now);
    }
    updateAudioUI();
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  // Pre-generate 1 sec white noise buffer for transient noise/explosion effects
  _getNoiseBuffer() {
    if (!this.ctx) return null;
    if (this.noiseBuffer) return this.noiseBuffer;
    const bufferSize = this.ctx.sampleRate * 1.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // 1. Refined UI Tactile Click
  playClick() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    // Subtone click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.025);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  // 2. Micro Hover Tick
  playHover() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
    
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.008);
  }

  // 3. Lowpass Filtered Tactical Warning / Alert Tone
  playAlert() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.connect(this.compressor);

    [110, 164.8, 220].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.94, now + 0.55);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      
      osc.connect(gain);
      gain.connect(filter);
      osc.start(now);
      osc.stop(now + 0.55);
    });
  }

  // 4. Play / Pause Chime
  playChime(isPlay) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    if (isPlay) {
      // Energetic ascending C5 -> E5 -> G5 arpeggio
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        
        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(start);
        osc.stop(start + 0.12);
      });
    } else {
      // Descending G5 -> C5 smooth pause chime
      const notes = [783.99, 523.25];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        
        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(start);
        osc.stop(start + 0.1);
      });
    }
  }

  // 5. Tactical Energy Laser Sweep
  playLaserShot() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 6. Multi-Layered Conquest Boom (Sub-bass drop + Noise transient + Resonance)
  playConquestBoom() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // Layer 1: Sub-Bass Sine Drop (90Hz -> 25Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.compressor);
    subOsc.start(now);
    subOsc.stop(now + 0.8);

    // Layer 2: Filtered Transient Noise Thud
    const noiseBuf = this._getNoiseBuffer();
    if (noiseBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const noiseFilter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();

      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(350, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(60, now + 0.15);

      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.compressor);

      noise.start(now);
      noise.stop(now + 0.15);
    }

    // Layer 3: Harmonic Shimmer (Triangle Chords 220Hz & 330Hz)
    [220, 329.63].forEach(freq => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      o.connect(g);
      g.connect(this.compressor);
      o.start(now);
      o.stop(now + 0.5);
    });
  }

  // 7. Dramatic Upset Reclaim Alarm (Underdog Annexation Reclaim)
  playUpset() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // Ascending tension triad resolving into a triumphant resonant chord
    const tensionNotes = [261.63, 311.13, 369.99]; // C4, Eb4, F#4
    tensionNotes.forEach((freq, idx) => {
      const start = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      osc.start(start);
      osc.stop(start + 0.3);
    });

    // Resolving triumphant chime note
    const resolveTime = now + 0.26;
    const resOsc = this.ctx.createOscillator();
    const resGain = this.ctx.createGain();
    resOsc.type = 'sine';
    resOsc.frequency.setValueAtTime(523.25, resolveTime); // C5
    resGain.gain.setValueAtTime(0.12, resolveTime);
    resGain.gain.exponentialRampToValueAtTime(0.001, resolveTime + 0.6);

    resOsc.connect(resGain);
    resGain.connect(this.compressor);
    resOsc.start(resolveTime);
    resOsc.stop(resolveTime + 0.6);
  }

  // 8. Match Score Toggle / Point Win Chime
  playMatchWin() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    [523.25, 659.25].forEach((freq, idx) => {
      const start = now + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.07, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  // 9. World Cup Champion Crowning Fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // Glorious major chord arpeggio: C4, E4, G4, C5, E5, G5, C6
    const fanfareNotes = [
      { freq: 261.63, time: 0 },
      { freq: 329.63, time: 0.08 },
      { freq: 392.00, time: 0.16 },
      { freq: 523.25, time: 0.24 },
      { freq: 659.25, time: 0.36 },
      { freq: 783.99, time: 0.48 },
      { freq: 1046.50, time: 0.60 }
    ];

    fanfareNotes.forEach(note => {
      const start = now + note.time;
      const duration = note.time >= 0.6 ? 1.0 : 0.4;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Mix triangle & sine for rich synth brass sound
      osc.type = note.time >= 0.6 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(note.freq, start);

      const vol = note.time >= 0.6 ? 0.15 : 0.08;
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(start);
      osc.stop(start + duration);
    });
  }

  // 10. Timeline Scrubbing Radar Tick
  playScan() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.012);
  }
}

var audio = (typeof window !== "undefined" && window.audio) ? window.audio : new TacticalAudio();
if (typeof window !== "undefined") {
  window.audio = audio;
}

// Backward compatible global toggle & UI update helpers
function toggleAudio() {
  audio.toggleMute();
  if (!audio.muted && audio.playClick) {
    audio.playClick();
  }
}

function setAudioVolume(val) {
  audio.setVolume(parseFloat(val));
}

function updateAudioUI() {
  const updateEl = (id, callback) => {
    const el = document.getElementById(id);
    if (el) callback(el);
  };

  const isZh = typeof currentLang !== "undefined" && currentLang === "zh";
  const pct = Math.round(audio.volume * 100);

  const btn = document.getElementById("btn-audio-toggle");
  if (audio.muted) {
    if (btn) {
      btn.classList.add("text-console-dimText");
      btn.classList.remove("text-console-accent");
    }
    const labelText = isZh ? "音效: 关闭" : "SFX: OFF";
    updateEl("audio-icon", e => e.className = "ph-bold ph-speaker-slash text-[10px]");
    updateEl("audio-label", e => e.innerText = labelText);
    updateEl("legend-audio-icon", e => e.className = "ph-bold ph-speaker-slash text-xs text-console-dimText");
    updateEl("sfx-volume-val", e => e.innerText = "OFF");
  } else {
    if (btn) {
      btn.classList.remove("text-console-dimText");
      btn.classList.add("text-console-accent");
    }
    const labelText = isZh ? `音效: ${pct}%` : `SFX: ${pct}%`;
    const iconClass = pct > 50 ? "ph-speaker-high" : (pct > 0 ? "ph-speaker-low" : "ph-speaker-none");
    updateEl("audio-icon", e => e.className = `ph-bold ${iconClass} text-[10px]`);
    updateEl("audio-label", e => e.innerText = labelText);
    updateEl("legend-audio-icon", e => e.className = `ph-bold ${iconClass} text-xs text-console-accent`);
    updateEl("sfx-volume-val", e => e.innerText = `${pct}%`);
  }

  const volSlider = document.getElementById("sfx-volume-slider");
  if (volSlider && parseFloat(volSlider.value) !== audio.volume) {
    volSlider.value = audio.volume;
  }
}

// Auto sync UI when DOM is ready
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    updateAudioUI();
  });
}
