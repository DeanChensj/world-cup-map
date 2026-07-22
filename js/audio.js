// --- Tactical Web Audio Synthesizer & Star Audio Engine ---
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
    this.loadStarBuffers();
  }

  // Preload and decode star MP3 audio samples into Web Audio buffers for 100% mobile Safari compatibility
  loadStarBuffers() {
    this.starAudioFiles = {
      siuuu: 'assets/audio/siuuu.mp3',
      messi: 'assets/audio/messi.mp3',
      bellingham: 'assets/audio/bellingham.mp3',
      haaland: 'assets/audio/haaland.mp3',
      mbappe: 'assets/audio/mbappe.wav'
    };

    if (!this.starBuffers) this.starBuffers = {};
    if (!this.starAudios) this.starAudios = {};
    if (!this.rawStarBuffers) this.rawStarBuffers = {};
    if (!this.loadingStarBuffers) this.loadingStarBuffers = {};

    Object.keys(this.starAudioFiles).forEach(key => {
      const url = this.starAudioFiles[key];
      if (!this.starAudios[key]) {
        this.starAudios[key] = new Audio(url);
        this.starAudios[key].load();
      }
      if (!this.starBuffers[key] && !this.loadingStarBuffers[key]) {
        this.loadingStarBuffers[key] = true;
        fetch(url)
          .then(res => res.arrayBuffer())
          .then(buf => {
            this.rawStarBuffers[key] = buf;
            if (this.ctx) {
              return this.ctx.decodeAudioData(buf.slice(0));
            }
          })
          .then(decoded => {
            if (decoded) {
              this.starBuffers[key] = decoded;
            }
            this.loadingStarBuffers[key] = false;
          })
          .catch(() => {
            this.loadingStarBuffers[key] = false;
          });
      }
    });
  }

  stopStarAudio() {
    if (this.activeStarSource) {
      try { this.activeStarSource.stop(); } catch (e) {}
      this.activeStarSource = null;
    }
    if (this.starAudios) {
      Object.keys(this.starAudios).forEach(key => {
        try {
          this.starAudios[key].pause();
          this.starAudios[key].currentTime = 0;
        } catch (e) {}
      });
    }
  }

  stopSiuuu() {
    this.stopStarAudio();
  }

  getStarGoalDurationMs(starType) {
    if (this.muted) return 1200;
    const key = (starType === 'ronaldo') ? 'siuuu' : starType;
    if (this.starBuffers?.[key]?.duration) {
      const dur = this.starBuffers[key].duration * 1000;
      return key === 'haaland' ? Math.min(3500, Math.round(dur)) : Math.round(dur);
    }
    if (this.starAudios?.[key]?.duration) {
      const dur = this.starAudios[key].duration * 1000;
      return key === 'haaland' ? Math.min(3500, Math.round(dur)) : Math.round(dur);
    }
    const defaults = { siuuu: 6660, ronaldo: 6660, messi: 3800, bellingham: 2870, haaland: 3500, mbappe: 2700 };
    return defaults[starType] || 1800;
  }

  getSiuuuDurationMs() {
    return this.getStarGoalDurationMs('siuuu');
  }

  playStarSampleSFX(key, side = '1', maxDuration = null) {
    if (this.muted) return false;
    this.init();
    this.stopStarAudio();

    if (this.starBuffers?.[key] && this.ctx) {
      const now = this.ctx.currentTime;
      const panVal = (side === '1') ? -0.35 : (side === '2') ? 0.35 : 0;
      let panner = null;
      if (this.ctx.createStereoPanner && panVal !== 0) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(panVal, now);
        panner.connect(this.compressor);
      }
      const outputNode = panner || this.compressor;

      const source = this.ctx.createBufferSource();
      source.buffer = this.starBuffers[key];

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(Math.min(1.2, this.volume * 1.2), now);

      source.connect(gainNode);
      gainNode.connect(outputNode);
      this.activeStarSource = source;
      source.onended = () => {
        if (this.activeStarSource === source) {
          this.activeStarSource = null;
        }
      };
      source.start(now);
      if (maxDuration) {
        source.stop(now + maxDuration);
      }
      return true;
    }

    if (this.starAudios?.[key]) {
      try {
        const audioEl = this.starAudios[key];
        audioEl.volume = Math.min(1.0, this.volume * 1.1);
        audioEl.currentTime = 0;
        const p = audioEl.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
        return true;
      } catch (e) {}
    }
    return false;
  }

  playSiuuuSFX(side = '1') {
    if (!this.playStarSampleSFX('siuuu', side)) {
      this.playGoalPop(4, side === '1' ? -0.35 : 0.35);
    }
  }

  playMessiSFX(side = '1') {
    if (!this.playStarSampleSFX('messi', side)) {
      this.playGoalPop(6, side === '1' ? -0.35 : 0.35);
    }
  }

  playBellinghamSFX(side = '1') {
    if (!this.playStarSampleSFX('bellingham', side)) {
      this.playGoalPop(3, side === '1' ? -0.35 : 0.35);
    }
  }

  playHaalandSFX(side = '1') {
    if (!this.playStarSampleSFX('haaland', side, 3.5)) {
      this.playGoalPop(5, side === '1' ? -0.35 : 0.35);
    }
  }

  playMbappeSFX(side = '1') {
    if (!this.playStarSampleSFX('mbappe', side)) {
      this.playGoalPop(2, side === '1' ? -0.35 : 0.35);
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

  // 1. Refined UI Tactile Click
  playClick() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    
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

  // 5. Official Referee Whistle Sound FX
  playWhistle() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    [2600, 3100].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
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

  // 6. Dramatic Upset Reclaim Alarm
  playUpset() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const tensionNotes = [261.63, 311.13, 369.99];
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

    const resolveTime = now + 0.26;
    const resOsc = this.ctx.createOscillator();
    const resGain = this.ctx.createGain();
    resOsc.type = 'sine';
    resOsc.frequency.setValueAtTime(523.25, resolveTime);
    resGain.gain.setValueAtTime(0.12, resolveTime);
    resGain.gain.exponentialRampToValueAtTime(0.001, resolveTime + 0.6);

    resOsc.connect(resGain);
    resGain.connect(this.compressor);
    resOsc.start(resolveTime);
    resOsc.stop(resolveTime + 0.6);
  }

  // 7. Match Score Toggle / Point Win Chime
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

  // 8. World Cup Champion Crowning Fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

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

  // 9. Timeline Scrubbing Radar Tick
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

  // 10. Warm Broadcast Goal Notification Chime
  playGoalPop(semitones = 0, pan = 0) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const mult = Math.pow(2, (semitones || 0) / 12);

    let panner = null;
    if (this.ctx.createStereoPanner && pan !== 0) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, now);
      panner.connect(this.compressor);
    }

    const outputNode = panner || this.compressor;

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

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(note.time === 0.16 ? 0.08 : 0.05, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (note.time === 0.16 ? 0.45 : 0.25));

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // 11. Own Goal (OG) Sound Signature
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

  playGoalSFX(type = 'regular', teamGoalCount = 1, side = '1') {
    if (this.muted) return;
    this.init();

    const baseOffset = (side === '2') ? 2 : 0;
    const teamCountShift = Math.min(6, (teamGoalCount - 1) * 2);
    const pitchShift = baseOffset + teamCountShift;

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

// Auto sync UI and unlock mobile audio context on first user interaction
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    updateAudioUI();
    if (typeof audio !== "undefined") {
      audio.loadStarBuffers();
    }
  });

  const unlockMobileAudio = () => {
    if (typeof audio !== "undefined") {
      audio.init();

      // Explicitly unlock Web Audio Context on iOS Safari with a 1-frame silent buffer
      if (audio.ctx) {
        if (audio.ctx.state === 'suspended') {
          audio.ctx.resume();
        }
        try {
          const buf = audio.ctx.createBuffer(1, 1, 22050);
          const src = audio.ctx.createBufferSource();
          src.buffer = buf;
          src.connect(audio.ctx.destination);
          src.start(0);
        } catch (e) {}
      }

      // Prime HTML5 Audios for iOS Safari autoplay permission
      if (audio.starAudios) {
        Object.keys(audio.starAudios).forEach(key => {
          try {
            const el = audio.starAudios[key];
            el.volume = 0;
            const p = el.play();
            if (p !== undefined) {
              p.then(() => {
                el.pause();
                el.currentTime = 0;
                el.volume = Math.min(1.0, audio.volume * 1.1);
              }).catch(() => {});
            }
          } catch (e) {}
        });
      }
    }
    window.removeEventListener("touchstart", unlockMobileAudio);
    window.removeEventListener("touchend", unlockMobileAudio);
    window.removeEventListener("click", unlockMobileAudio);
  };

  window.addEventListener("touchstart", unlockMobileAudio, { passive: true });
  window.addEventListener("touchend", unlockMobileAudio, { passive: true });
  window.addEventListener("click", unlockMobileAudio, { passive: true });
}
