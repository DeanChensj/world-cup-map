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

  // 5. Official Referee Whistle Sound FX (Replaces sci-fi laser shot)
  playWhistle() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // Dual trill sine frequencies for realistic referee whistle
    [2600, 3100].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // 35Hz fast trill modulation
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      mod.frequency.value = 35;
      modGain.gain.value = 80;
      mod.connect(osc.frequency);
      mod.start(now);
      mod.stop(now + 0.22);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now);
      osc.stop(now + 0.22);
    });
  }

  playLaserShot() {
    this.playWhistle();
  }

  // 6. Clean Stadium Match Annexation Cheer (Replaces heavy missile bombardment boom)
  playConquestBoom() {
    if (this.muted) return;
    this.init();
    this.playMatchWin();
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

  // 11. Warm Broadcast Goal Notification Chime with Spatial Stereo Panning & Pitch Escalation
  playGoalPop(semitones = 0, pan = 0) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const mult = Math.pow(2, (semitones || 0) / 12);

    // Optional Spatial Stereo Panner
    let panner = null;
    if (this.ctx.createStereoPanner && pan !== 0) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, now);
      panner.connect(this.compressor);
    }

    const outputNode = panner || this.compressor;

    // Melodic bell arpeggio dynamically transposed by pitch escalation factor
    const chord = [
      { freq: 523.25 * mult, time: 0 },
      { freq: 659.25 * mult, time: 0.05 },
      { freq: 783.99 * mult, time: 0.10 },
      { freq: 1046.50 * mult, time: 0.16 }
    ];

    chord.forEach(note => {
      const start = now + note.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, start);

      // Soft envelope (Soft 15ms ramp, zero click, zero gunshot snap)
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(note.time === 0.16 ? 0.08 : 0.05, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (note.time === 0.16 ? 0.45 : 0.25));

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // 12. Clean Downward Own Goal (OG) Sound Signature with Stereo Panning
  playOGPop(pan = 0) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    let panner = null;
    if (this.ctx.createStereoPanner && pan !== 0) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, now);
      panner.connect(this.compressor);
    }

    const outputNode = panner || this.compressor;

    // Downward 3-note drop: E5 (659Hz) -> C5 (523Hz) -> A4 (440Hz)
    const ogNotes = [659.25, 523.25, 440.00];
    ogNotes.forEach((freq, idx) => {
      const start = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  // 13. Authentic Cristiano Ronaldo "SIUUU!" Audio Sample Playback
  playSiuuuSFX(side = '1') {
    if (this.muted) return;
    this.init();

    try {
      if (!this.siuuuAudio) {
        this.siuuuAudio = new Audio('assets/audio/siuuu.mp3');
      }
      this.siuuuAudio.volume = Math.min(1.0, this.volume * 1.1);
      this.siuuuAudio.currentTime = 0;
      const playPromise = this.siuuuAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          this.playSiuuuSynth(side);
        });
      }
    } catch (e) {
      this.playSiuuuSynth(side);
    }
  }

  // Fallback Synthesizer for SIUUU
  playSiuuuSynth(side = '1') {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const panVal = (side === '1') ? -0.35 : (side === '2') ? 0.35 : 0;
    let panner = null;
    if (this.ctx.createStereoPanner && panVal !== 0) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(panVal, now);
      panner.connect(this.compressor);
    }
    const outputNode = panner || this.compressor;

    // High crisp whistle / "SI..." entrance (0ms -> 120ms)
    const sOsc = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    sOsc.type = 'sine';
    sOsc.frequency.setValueAtTime(1400, now);
    sOsc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);

    sGain.gain.setValueAtTime(0.001, now);
    sGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
    sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    sOsc.connect(sGain);
    sGain.connect(outputNode);
    sOsc.start(now);
    sOsc.stop(now + 0.12);

    const chordGlide = [
      { startFreq: 587.33, endFreq: 440.00, time: 0.10 },
      { startFreq: 739.99, endFreq: 554.37, time: 0.10 },
      { startFreq: 880.00, endFreq: 659.25, time: 0.10 },
      { startFreq: 1174.66, endFreq: 880.00, time: 0.10 }
    ];

    chordGlide.forEach(note => {
      const start = now + note.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.startFreq, start);
      osc.frequency.exponentialRampToValueAtTime(note.endFreq, start + 0.85);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.90);

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(start);
      osc.stop(start + 0.90);
    });
  }

  playGoalSFX(type = 'regular', teamGoalCount = 1, side = '1') {
    if (this.muted) return;
    this.init();

    // Side 1 (Home/Left) starts at base, Side 2 (Away/Right) starts slightly higher for tonal contrast
    const baseOffset = (side === '2') ? 2 : 0;
    const teamCountShift = Math.min(6, (teamGoalCount - 1) * 2);
    const pitchShift = baseOffset + teamCountShift;

    // Spatial stereo panning (-0.35 for Team A / +0.35 for Team B)
    const panVal = (side === '1') ? -0.35 : (side === '2') ? 0.35 : 0;

    if (type === 'penalty') {
      this.playWhistle();
      setTimeout(() => this.playGoalPop(pitchShift, panVal), 120);
    } else if (type === 'og') {
      this.playOGPop(panVal);
    } else if (type === 'late') {
      this.playGoalPop(pitchShift + 3, panVal);
      setTimeout(() => this.playVictory(), 200);
    } else {
      this.playGoalPop(pitchShift, panVal);
    }
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
