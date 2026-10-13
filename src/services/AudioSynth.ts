export class AudioSynthService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private musicGainNode: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.15;
    this.masterGain.connect(this.ctx.destination);
  }

  // --- Core Sound Effects ---
  public playFootstep() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playJump() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playSlide() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playCollect() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playHit() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /* NEW CODE ADDITIONS START: COMBO MULTIPLIER AUDIO SYNTHESIS */
  public playComboUp(comboCount: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale frequency calculation with octave escalation
    const baseFreq = 440;
    const semitones = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const index = Math.min(comboCount - 1, semitones.length - 1);
    const semitone = semitones[Math.max(0, index)];
    const targetFreq = baseFreq * Math.pow(2, semitone / 12);

    osc.type = comboCount >= 10 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(targetFreq * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playComboBreak() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  /* NEW CODE ADDITIONS END: COMBO MULTIPLIER AUDIO SYNTHESIS */

  /* NEW CODE ADDITIONS START: DIMENSION SHIFT & INTANGIBILITY AUDIO SYNTHESIS */
  public playDimensionShift() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // High energy ascending riser & frequency sweep
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.45);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.exponentialRampToValueAtTime(2800, now + 0.45);

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  public playPhaseThrough() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Ethereal phase whoosh + cyber resonant ping
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
  /* NEW CODE ADDITIONS END: DIMENSION SHIFT & INTANGIBILITY AUDIO SYNTHESIS */

  /* NEW CODE ADDITIONS START: POWER-UP COLLECTIBLE AUDIO SYNTHESIS */
  public playPowerUpCollect() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Harmonized triad arpeggio power-up sound
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  public playShieldDeflect() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playPowerUpExpire() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /* NEW CODE ADDITIONS START: COMBO FREEZE AUDIO SYNTHESIS */
  public playComboFreezeCollect() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Crystalline sub-zero glissando (ice bell arpeggio)
    const freqs = [880.0, 1174.66, 1760.0, 2349.32, 3520.0];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.04 + 0.35);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now + idx * 0.04);
      filter.Q.setValueAtTime(8, now + idx * 0.04);

      gain.gain.setValueAtTime(0.24, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.45);
    });
  }

  public playComboFreezeProtect() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // High crystalline ping indicating freeze shield deflected the combo break
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1760.0, now);
    osc.frequency.exponentialRampToValueAtTime(2637.02, now + 0.12);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(880.0, now);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.25);
    subOsc.stop(now + 0.25);
  }
  /* NEW CODE ADDITIONS END: COMBO FREEZE AUDIO SYNTHESIS */
  /* NEW CODE ADDITIONS END: POWER-UP COLLECTIBLE AUDIO SYNTHESIS */

  /* NEW CODE ADDITIONS START: DIMENSION TIER UP AUDIO SYNTHESIS */
  public playDimensionTierUp() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Resonant cyber warp chord (low octave to high crystalline shimmer)
    const tierChord = [220.0, 329.63, 440.0, 659.25, 880.0, 1318.5];
    tierChord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.75, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.04 + 0.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now + idx * 0.04);
      filter.frequency.exponentialRampToValueAtTime(4000, now + idx * 0.04 + 0.5);

      gain.gain.setValueAtTime(0.18, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.7);
    });
  }
  /* NEW CODE ADDITIONS END: DIMENSION TIER UP AUDIO SYNTHESIS */

  /* NEW CODE ADDITIONS START: DAILY MISSION AUDIO SYNTHESIS */
  public playMissionComplete() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Cyberpunk triumphant fanfaric chord progression: F# -> A# -> C# -> F
    const fanfareNotes = [370.0, 466.16, 554.37, 698.46, 740.0, 932.33, 1108.73];
    fanfareNotes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, startTime + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, startTime);
      filter.frequency.exponentialRampToValueAtTime(6000, startTime + 0.15);

      gain.gain.setValueAtTime(0.26, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.52);
    });
  }
  /* NEW CODE ADDITIONS END: DAILY MISSION AUDIO SYNTHESIS */

  // --- Aliases & Complex Sounds for useGameStore ---
  public playJumpSound() { this.playJump(); }
  public playSlideSound() { this.playSlide(); }
  public playCollectSound() { this.playCollect(); }
  public playDamageSound() { this.playHit(); }

  public playGameOverSound() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  /* NEW CODE ADDITIONS START: DIMENSION TIER AMBIENT BASSLINE SYSTEM */
  private currentTier = 0;
  private noteIdx = 0;
  private subDroneOsc: OscillatorNode | null = null;
  private subDroneGain: GainNode | null = null;
  private subDroneFilter: BiquadFilterNode | null = null;

  // Preset profiles for each Dimension Tier
  private readonly tierBasslines = [
    // Tier 0: CYBER VOID - Deep obsidian sub-industrial pulse
    {
      name: 'CYBER VOID',
      intervalMs: 150,
      oscType: 'sawtooth' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterCutoff: 240,
      filterQ: 3.5,
      subDroneFreq: 36.71, // Low D1
      gainValue: 0.05,
      pattern: [36.71, 36.71, 73.42, 36.71, 43.65, 49.0, 55.0, 36.71, 73.42, 36.71, 65.41, 55.0, 36.71, 43.65, 55.0, 73.42],
      accentIndices: [0, 4, 8, 12],
    },
    // Tier 1: SYNTHWAVE HORIZON - Neon indigo galloping outrun bassline
    {
      name: 'SYNTHWAVE HORIZON',
      intervalMs: 140,
      oscType: 'sawtooth' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterCutoff: 580,
      filterQ: 4.2,
      subDroneFreq: 55.0, // A1
      gainValue: 0.055,
      pattern: [55.0, 110.0, 55.0, 110.0, 43.65, 87.31, 43.65, 87.31, 49.0, 98.0, 49.0, 98.0, 41.2, 82.41, 49.0, 110.0],
      accentIndices: [0, 2, 4, 6, 8, 10, 12, 14],
    },
    // Tier 2: MATRIX OVERCLOCK - Toxic acid 303 resonant squelch sequence
    {
      name: 'MATRIX OVERCLOCK',
      intervalMs: 125,
      oscType: 'sawtooth' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterCutoff: 750,
      filterQ: 8.5,
      subDroneFreq: 41.2, // E1
      gainValue: 0.06,
      pattern: [82.41, 82.41, 164.81, 87.31, 98.0, 82.41, 123.47, 82.41, 146.83, 164.81, 82.41, 110.0, 98.0, 87.31, 123.47, 82.41],
      accentIndices: [2, 6, 9, 14],
    },
    // Tier 3: SOLAR CRUCIBLE - Crimson flare heavy industrial aggro crunch
    {
      name: 'SOLAR CRUCIBLE',
      intervalMs: 135,
      oscType: 'square' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterCutoff: 440,
      filterQ: 5.5,
      subDroneFreq: 32.7, // Low C1
      gainValue: 0.05,
      pattern: [65.41, 32.7, 65.41, 77.78, 65.41, 92.5, 87.31, 65.41, 32.7, 65.41, 98.0, 65.41, 116.54, 92.5, 87.31, 65.41],
      accentIndices: [0, 3, 5, 8, 10, 12],
    },
    // Tier 4: SINGULARITY NEXUS - Hyper-void event horizon reese bass & cosmic velocity
    {
      name: 'SINGULARITY NEXUS',
      intervalMs: 115,
      oscType: 'sawtooth' as OscillatorType,
      filterType: 'bandpass' as BiquadFilterType,
      filterCutoff: 950,
      filterQ: 6.0,
      subDroneFreq: 46.25, // F#1
      gainValue: 0.065,
      pattern: [92.5, 185.0, 138.59, 92.5, 110.0, 220.0, 164.81, 110.0, 138.59, 277.18, 185.0, 138.59, 82.41, 164.81, 110.0, 92.5],
      accentIndices: [0, 1, 4, 5, 8, 9, 12, 13],
    },
  ];

  public setDimensionTier(tier: number) {
    const clampedTier = Math.max(0, Math.min(tier, this.tierBasslines.length - 1));
    if (this.currentTier === clampedTier) return;
    this.currentTier = clampedTier;

    // Smoothly morph continuous sub-drone to new tier root frequency
    if (this.ctx && this.subDroneOsc && this.subDroneFilter) {
      const now = this.ctx.currentTime;
      const config = this.tierBasslines[this.currentTier];
      this.subDroneOsc.frequency.exponentialRampToValueAtTime(
        Math.max(20, config.subDroneFreq),
        now + 0.8
      );
      this.subDroneFilter.frequency.exponentialRampToValueAtTime(
        Math.max(60, config.filterCutoff * 0.5),
        now + 0.8
      );
    }

    // Restart rhythm interval to sync with new tier tempo without interruption
    if (this.isMusicPlaying) {
      this.restartMusicInterval();
    }
  }

  public getDimensionTier(): number {
    return this.currentTier;
  }

  private startSubDrone() {
    if (!this.ctx || !this.masterGain) return;
    this.stopSubDrone();

    const config = this.tierBasslines[this.currentTier];
    const now = this.ctx.currentTime;

    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneFilter = this.ctx.createBiquadFilter();
    this.subDroneGain = this.ctx.createGain();

    this.subDroneOsc.type = 'triangle';
    this.subDroneOsc.frequency.setValueAtTime(config.subDroneFreq, now);

    this.subDroneFilter.type = 'lowpass';
    this.subDroneFilter.frequency.setValueAtTime(config.filterCutoff * 0.45, now);
    this.subDroneFilter.Q.setValueAtTime(2.0, now);

    this.subDroneGain.gain.setValueAtTime(0.001, now);
    this.subDroneGain.gain.exponentialRampToValueAtTime(0.035, now + 1.0);

    this.subDroneOsc.connect(this.subDroneFilter);
    this.subDroneFilter.connect(this.subDroneGain);
    this.subDroneGain.connect(this.masterGain);

    this.subDroneOsc.start(now);
  }

  private stopSubDrone() {
    if (this.subDroneOsc) {
      try {
        this.subDroneOsc.stop();
        this.subDroneOsc.disconnect();
      } catch {
        // Ignored
      }
      this.subDroneOsc = null;
    }
    if (this.subDroneFilter) {
      this.subDroneFilter.disconnect();
      this.subDroneFilter = null;
    }
    if (this.subDroneGain) {
      this.subDroneGain.disconnect();
      this.subDroneGain = null;
    }
  }

  private triggerBassStep() {
    if (!this.ctx || !this.isMusicPlaying || !this.masterGain) return;

    const config = this.tierBasslines[this.currentTier];
    const now = this.ctx.currentTime;
    const stepIdx = this.noteIdx % config.pattern.length;
    const freq = config.pattern[stepIdx];
    const isAccent = config.accentIndices.includes(stepIdx);
    this.noteIdx++;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc.type = config.oscType;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = config.filterType;
    const baseCutoff = isAccent ? config.filterCutoff * 1.5 : config.filterCutoff;
    filter.frequency.setValueAtTime(baseCutoff, now);
    if (isAccent) {
      filter.frequency.exponentialRampToValueAtTime(config.filterCutoff * 0.5, now + 0.12);
    }
    filter.Q.setValueAtTime(config.filterQ, now);

    const stepGain = isAccent ? config.gainValue * 1.4 : config.gainValue;
    const decayDuration = isAccent ? 0.18 : 0.11;
    noteGain.gain.setValueAtTime(stepGain, now);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + decayDuration);

    osc.connect(filter);
    filter.connect(noteGain);
    if (this.musicGainNode) {
      noteGain.connect(this.musicGainNode);
    } else {
      noteGain.connect(this.masterGain);
    }

    osc.start(now);
    osc.stop(now + decayDuration + 0.02);
  }

  private restartMusicInterval() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (!this.isMusicPlaying) return;
    const config = this.tierBasslines[this.currentTier];
    this.musicInterval = window.setInterval(() => {
      this.triggerBassStep();
    }, config.intervalMs);
  }

  // --- Procedural Background Music with Dimension Tier Basslines ---
  public startMusic(tier = 0) {
    if (this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.currentTier = Math.max(0, Math.min(tier, this.tierBasslines.length - 1));
    this.isMusicPlaying = true;
    this.noteIdx = 0;

    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(0.07, this.ctx.currentTime);
    if (this.masterGain) {
      this.musicGainNode.connect(this.masterGain);
    } else {
      this.musicGainNode.connect(this.ctx.destination);
    }

    this.startSubDrone();
    this.restartMusicInterval();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.stopSubDrone();
    if (this.musicGainNode) {
      this.musicGainNode.disconnect();
      this.musicGainNode = null;
    }
  }
  /* NEW CODE ADDITIONS END: DIMENSION TIER AMBIENT BASSLINE SYSTEM */
}

export const audioSynth = new AudioSynthService();
export const AudioSynth = audioSynth;