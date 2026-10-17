/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private currentTrack = 0;

  private sfxVolume = 0.7;
  private bgmVolume = 0.4;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();

      this.sfxGain.gain.value = this.sfxVolume;
      this.bgmGain.gain.value = this.bgmVolume;

      this.sfxGain.connect(this.masterGain);
      this.bgmGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, bgm: number) {
    this.sfxVolume = sfx;
    this.bgmVolume = bgm;
    if (this.sfxGain) this.sfxGain.gain.value = this.isMuted ? 0 : sfx;
    if (this.bgmGain) this.bgmGain.gain.value = this.isMuted ? 0 : bgm;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ---- SOUND EFFECTS ----

  public playFlipper(isLeft: boolean = true) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isLeft ? 320 : 360, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // AudioContext policy
    }
  }

  public playBumper(level = 0) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Classic XP Pinball double-tone bumper resonance
      const baseFreq = 540 + (level % 4) * 110;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc2.type = 'triangle';

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

      osc2.frequency.setValueAtTime(baseFreq * 2, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.18);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.2);
      osc2.stop(now + 0.2);
    } catch {
      // AudioContext policy
    }
  }

  public playSlingshot() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext policy
    }
  }

  public playTrampoline() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Nostalgic 공튀기기 spring sound: ascending rubber slide
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.22);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // AudioContext policy
    }
  }

  public playStarRing() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // 3-note sparkling chime
      const notes = [880, 1174, 1760];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.04);

        noteGain.gain.setValueAtTime(0.35, now + idx * 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.18);

        noteOsc.connect(noteGain);
        noteGain.connect(this.sfxGain);

        noteOsc.start(now + idx * 0.04);
        noteOsc.stop(now + idx * 0.04 + 0.18);
      });
    } catch {
      // AudioContext policy
    }
  }

  public playHyperspace() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // AudioContext policy
    }
  }

  public playPlungerRelease(power = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const targetFreq = 180 + power * 350;
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.12);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext policy
    }
  }

  public playSpikeHazard() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext policy
    }
  }

  public playLevelClear() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      chords.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.4, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // AudioContext policy
    }
  }

  public playGameOver() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const notes = [392, 349.23, 311.13, 261.63]; // G F Eb C
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.4, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.14 + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.28);
      });
    } catch {
      // AudioContext policy
    }
  }

  // ---- PROCEDURAL SYNTH BGM ----

  public startBgm(track = 0) {
    this.currentTrack = track;
    this.initContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleBgmTick();
  }

  public setBgmTrack(track: number) {
    this.currentTrack = track;
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleBgmTick = () => {
    if (!this.isBgmPlaying) return;

    try {
      if (this.ctx && this.bgmGain && !this.isMuted) {
        const now = this.ctx.currentTime;

        // Tracks definition
        if (this.currentTrack === 0) {
          // Space Cadet 1995: Cosmic Sci-Fi Pinball Arp (C minor / Eb / Bb)
          const arpPatterns = [
            [261.63, 311.13, 392.0, 523.25], // Cm
            [233.08, 293.66, 349.23, 466.16], // Bb
            [207.65, 261.63, 311.13, 415.3], // Ab
            [196.0, 246.94, 293.66, 392.0], // G
          ];
          const patternIdx = Math.floor((this.bgmStep / 8) % arpPatterns.length);
          const noteIdx = this.bgmStep % 4;
          const freq = arpPatterns[patternIdx][noteIdx];

          // Synth Arp Note
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 0.14);

          // Pulse kick on beat 0 and 4
          if (this.bgmStep % 4 === 0) {
            const kick = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(120, now);
            kick.frequency.exponentialRampToValueAtTime(35, now + 0.1);
            kickGain.gain.setValueAtTime(0.2, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            kick.connect(kickGain);
            kickGain.connect(this.bgmGain);
            kick.start(now);
            kick.stop(now + 0.1);
          }
        } else if (this.currentTrack === 1) {
          // Bounce Adventure: Joyful Korean 8-bit platformer melody (F major / D minor)
          const melody = [
            349.23, 392.0, 440.0, 523.25, 440.0, 392.0, 349.23, 293.66,
            329.63, 349.23, 392.0, 440.0, 392.0, 349.23, 329.63, 261.63,
          ];
          const freq = melody[this.bgmStep % melody.length];

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.11);

          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 0.12);

          // Light high-hat on every 2nd step
          if (this.bgmStep % 2 === 1) {
            const hat = this.ctx.createOscillator();
            const hatGain = this.ctx.createGain();
            hat.type = 'triangle';
            hat.frequency.setValueAtTime(1800, now);
            hatGain.gain.setValueAtTime(0.04, now);
            hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            hat.connect(hatGain);
            hatGain.connect(this.bgmGain);
            hat.start(now);
            hat.stop(now + 0.04);
          }
        } else {
          // Cyber Neon Duel: Driving Synthwave Bass & High Tech Arp
          const bassNotes = [110, 110, 130.81, 146.83, 98, 98, 110, 123.47];
          const freq = bassNotes[this.bgmStep % bassNotes.length];

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 0.15);
        }
      }
    } catch {
      // Ignored for autoplay rules
    }

    this.bgmStep++;
    // 130 BPM sixteenth notes = 60000 / 130 / 4 = ~115ms
    this.bgmTimer = window.setTimeout(this.scheduleBgmTick, 125);
  };
}

export const soundEngine = new SoundEngine();
