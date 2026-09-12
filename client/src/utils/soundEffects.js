// 5 Rich Customizable Audio Themes & Sound Packs for Life RPG

export const SOUND_PACKS = [
  {
    id: 'retro-arcade',
    name: '8-Bit Retro Arcade',
    icon: '🕹️',
    description: 'Chiptune square-wave bleeps, 8-bit coins, and retro jump/power-up tones.',
    wave: 'square'
  },
  {
    id: 'crystal-chimes',
    name: 'Crystal Fantasy Chimes',
    icon: '🔮',
    description: 'Ethereal sine glass chimes, celesta bells, and ringing magical tones.',
    wave: 'sine'
  },
  {
    id: 'cyber-synth',
    name: 'Cyberpunk High-Tech',
    icon: '⚡',
    description: 'Futuristic sawtooth laser pulses, cybernetic sweeps, and neon blips.',
    wave: 'sawtooth'
  },
  {
    id: 'zen-marimba',
    name: 'Zen Wooden Marimba',
    icon: '🪵',
    description: 'Warm organic wooden xylophone taps and peaceful mellow chords.',
    wave: 'triangle'
  },
  {
    id: 'heroic-brass',
    name: 'Heroic Realm Fanfare',
    icon: '🎺',
    description: 'Royal brass trumpet fanfare chords and grand heroic anthem melodies.',
    wave: 'custom'
  }
];

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.currentPack = 'retro-arcade';

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_rpg_sound_pack');
      if (saved) this.currentPack = saved;
    }
  }

  getAudioContext() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext init error:', e);
      return null;
    }
  }

  setPack(packId) {
    if (SOUND_PACKS.some(p => p.id === packId)) {
      this.currentPack = packId;
    }
  }

  playNoteSequence(notes) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const baseTime = ctx.currentTime;

      notes.forEach(({ freq, duration, delay = 0, type = 'sine', volume = 0.25 }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, baseTime + delay);

        gain.gain.setValueAtTime(0.001, baseTime + delay);
        gain.gain.linearRampToValueAtTime(volume, baseTime + delay + 0.015);
        gain.gain.linearRampToValueAtTime(0.0001, baseTime + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(baseTime + delay);
        osc.stop(baseTime + delay + duration + 0.03);
      });
    } catch (err) {
      console.warn('Play note error:', err);
    }
  }

  // 1. Quest Completion Sound
  playQuestComplete(pack = this.currentPack) {
    switch (pack) {
      case 'crystal-chimes':
        this.playNoteSequence([
          { freq: 587.33, duration: 0.35, delay: 0, type: 'sine', volume: 0.28 },
          { freq: 880.00, duration: 0.4, delay: 0.09, type: 'sine', volume: 0.3 },
          { freq: 1174.66, duration: 0.5, delay: 0.18, type: 'sine', volume: 0.32 },
          { freq: 1760.00, duration: 0.7, delay: 0.28, type: 'sine', volume: 0.25 }
        ]);
        break;

      case 'cyber-synth':
        this.playNoteSequence([
          { freq: 300, duration: 0.08, delay: 0, type: 'sawtooth', volume: 0.2 },
          { freq: 600, duration: 0.08, delay: 0.06, type: 'sawtooth', volume: 0.22 },
          { freq: 900, duration: 0.12, delay: 0.12, type: 'sawtooth', volume: 0.25 },
          { freq: 1200, duration: 0.25, delay: 0.18, type: 'triangle', volume: 0.28 }
        ]);
        break;

      case 'zen-marimba':
        this.playNoteSequence([
          { freq: 392.00, duration: 0.15, delay: 0, type: 'triangle', volume: 0.3 },
          { freq: 493.88, duration: 0.15, delay: 0.08, type: 'triangle', volume: 0.3 },
          { freq: 587.33, duration: 0.18, delay: 0.16, type: 'triangle', volume: 0.32 },
          { freq: 783.99, duration: 0.3, delay: 0.24, type: 'triangle', volume: 0.28 }
        ]);
        break;

      case 'heroic-brass':
        this.playNoteSequence([
          { freq: 523.25, duration: 0.18, delay: 0, type: 'sawtooth', volume: 0.18 },
          { freq: 659.25, duration: 0.18, delay: 0.1, type: 'sawtooth', volume: 0.2 },
          { freq: 783.99, duration: 0.22, delay: 0.2, type: 'triangle', volume: 0.28 },
          { freq: 1046.50, duration: 0.45, delay: 0.3, type: 'sine', volume: 0.3 }
        ]);
        break;

      case 'retro-arcade':
      default:
        this.playNoteSequence([
          { freq: 440.00, duration: 0.1, delay: 0, type: 'square', volume: 0.2 },
          { freq: 554.37, duration: 0.1, delay: 0.08, type: 'square', volume: 0.22 },
          { freq: 659.25, duration: 0.12, delay: 0.16, type: 'square', volume: 0.24 },
          { freq: 880.00, duration: 0.28, delay: 0.24, type: 'square', volume: 0.26 }
        ]);
        break;
    }
  }

  // 2. Coin Earning Sound
  playCoin(pack = this.currentPack) {
    switch (pack) {
      case 'crystal-chimes':
        this.playNoteSequence([
          { freq: 1318.51, duration: 0.2, delay: 0, type: 'sine', volume: 0.25 },
          { freq: 2093.00, duration: 0.4, delay: 0.07, type: 'sine', volume: 0.22 }
        ]);
        break;

      case 'cyber-synth':
        this.playNoteSequence([
          { freq: 800, duration: 0.05, delay: 0, type: 'sawtooth', volume: 0.18 },
          { freq: 1600, duration: 0.18, delay: 0.05, type: 'triangle', volume: 0.22 }
        ]);
        break;

      case 'zen-marimba':
        this.playNoteSequence([
          { freq: 659.25, duration: 0.12, delay: 0, type: 'triangle', volume: 0.28 },
          { freq: 987.77, duration: 0.2, delay: 0.07, type: 'triangle', volume: 0.25 }
        ]);
        break;

      case 'heroic-brass':
        this.playNoteSequence([
          { freq: 783.99, duration: 0.1, delay: 0, type: 'triangle', volume: 0.22 },
          { freq: 1046.50, duration: 0.25, delay: 0.08, type: 'sine', volume: 0.26 }
        ]);
        break;

      case 'retro-arcade':
      default:
        this.playNoteSequence([
          { freq: 987.77, duration: 0.08, delay: 0, type: 'square', volume: 0.2 },
          { freq: 1318.51, duration: 0.22, delay: 0.06, type: 'square', volume: 0.24 }
        ]);
        break;
    }
  }

  // 3. Level Up Fanfare
  playLevelUp(pack = this.currentPack) {
    switch (pack) {
      case 'crystal-chimes':
        this.playNoteSequence([
          { freq: 523.25, duration: 0.3, delay: 0, type: 'sine', volume: 0.28 },
          { freq: 659.25, duration: 0.3, delay: 0.12, type: 'sine', volume: 0.3 },
          { freq: 783.99, duration: 0.3, delay: 0.24, type: 'sine', volume: 0.32 },
          { freq: 1046.50, duration: 0.6, delay: 0.36, type: 'sine', volume: 0.35 }
        ]);
        break;

      case 'cyber-synth':
        this.playNoteSequence([
          { freq: 400, duration: 0.1, delay: 0, type: 'sawtooth', volume: 0.2 },
          { freq: 600, duration: 0.1, delay: 0.1, type: 'sawtooth', volume: 0.22 },
          { freq: 800, duration: 0.12, delay: 0.2, type: 'sawtooth', volume: 0.24 },
          { freq: 1200, duration: 0.4, delay: 0.3, type: 'sawtooth', volume: 0.28 }
        ]);
        break;

      case 'zen-marimba':
        this.playNoteSequence([
          { freq: 392.00, duration: 0.2, delay: 0, type: 'triangle', volume: 0.3 },
          { freq: 523.25, duration: 0.2, delay: 0.12, type: 'triangle', volume: 0.32 },
          { freq: 659.25, duration: 0.2, delay: 0.24, type: 'triangle', volume: 0.34 },
          { freq: 783.99, duration: 0.45, delay: 0.36, type: 'triangle', volume: 0.36 }
        ]);
        break;

      case 'heroic-brass':
        this.playNoteSequence([
          { freq: 523.25, duration: 0.15, delay: 0, type: 'sawtooth', volume: 0.2 },
          { freq: 659.25, duration: 0.15, delay: 0.12, type: 'sawtooth', volume: 0.22 },
          { freq: 783.99, duration: 0.15, delay: 0.24, type: 'triangle', volume: 0.28 },
          { freq: 1046.50, duration: 0.35, delay: 0.36, type: 'triangle', volume: 0.32 },
          { freq: 880.00, duration: 0.15, delay: 0.52, type: 'triangle', volume: 0.28 },
          { freq: 1046.50, duration: 0.6, delay: 0.64, type: 'sine', volume: 0.35 }
        ]);
        break;

      case 'retro-arcade':
      default:
        this.playNoteSequence([
          { freq: 440, duration: 0.1, delay: 0, type: 'square', volume: 0.22 },
          { freq: 554, duration: 0.1, delay: 0.09, type: 'square', volume: 0.22 },
          { freq: 659, duration: 0.1, delay: 0.18, type: 'square', volume: 0.24 },
          { freq: 880, duration: 0.2, delay: 0.27, type: 'square', volume: 0.28 },
          { freq: 740, duration: 0.12, delay: 0.42, type: 'square', volume: 0.24 },
          { freq: 880, duration: 0.45, delay: 0.52, type: 'square', volume: 0.3 }
        ]);
        break;
    }
  }

  // 4. Button Click (Themed per Sound Pack!)
  playButton(pack = this.currentPack) {
    switch (pack) {
      case 'crystal-chimes':
        this.playNoteSequence([{ freq: 1046.50, duration: 0.08, delay: 0, type: 'sine', volume: 0.15 }]);
        break;
      case 'cyber-synth':
        this.playNoteSequence([{ freq: 880, duration: 0.04, delay: 0, type: 'sawtooth', volume: 0.12 }]);
        break;
      case 'zen-marimba':
        this.playNoteSequence([{ freq: 523.25, duration: 0.06, delay: 0, type: 'triangle', volume: 0.18 }]);
        break;
      case 'heroic-brass':
        this.playNoteSequence([{ freq: 659.25, duration: 0.07, delay: 0, type: 'sawtooth', volume: 0.12 }]);
        break;
      case 'retro-arcade':
      default:
        this.playNoteSequence([{ freq: 440, duration: 0.05, delay: 0, type: 'square', volume: 0.1 }]);
        break;
    }
  }

  // 5. Error Tone
  playError(pack = this.currentPack) {
    switch (pack) {
      case 'crystal-chimes':
        this.playNoteSequence([
          { freq: 350, duration: 0.15, delay: 0, type: 'sine', volume: 0.18 },
          { freq: 280, duration: 0.2, delay: 0.08, type: 'sine', volume: 0.18 }
        ]);
        break;
      case 'cyber-synth':
        this.playNoteSequence([
          { freq: 200, duration: 0.1, delay: 0, type: 'sawtooth', volume: 0.2 },
          { freq: 150, duration: 0.15, delay: 0.08, type: 'sawtooth', volume: 0.2 }
        ]);
        break;
      case 'zen-marimba':
        this.playNoteSequence([
          { freq: 261.63, duration: 0.12, delay: 0, type: 'triangle', volume: 0.22 },
          { freq: 220.00, duration: 0.18, delay: 0.08, type: 'triangle', volume: 0.22 }
        ]);
        break;
      case 'heroic-brass':
      case 'retro-arcade':
      default:
        this.playNoteSequence([
          { freq: 220, duration: 0.12, delay: 0, type: 'sawtooth', volume: 0.16 },
          { freq: 180, duration: 0.16, delay: 0.08, type: 'sawtooth', volume: 0.16 }
        ]);
        break;
    }
  }
}

export const sounds = new SoundManager();
