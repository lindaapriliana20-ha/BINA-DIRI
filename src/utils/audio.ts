/**
 * Web Audio API Sound Synthesizer & Indonesian Speech Assistant for CINTA NADI
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle bubble pop sound (for taps, bubbles, motion hits)
 */
export function playPop(volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    console.warn('Audio pop error:', e);
  }
}

/**
 * Play a bright pleasant chime (when completing a step or gaining points)
 */
export function playChime(volume = 0.35) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      const start = now + idx * 0.06;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

/**
 * Play star sparkle sound (when getting stars or points)
 */
export function playStarSound(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      const start = now + i * 0.05;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch (e) {
    console.warn('Audio star error:', e);
  }
}

/**
 * Grand Victory Fanfare when reaching Score 100 ("Selamat, Hebat!")
 */
export function playFanfare(volume = 0.45) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fanfare motif: C4, E4, G4, C5 (short), C5 (sustained), G4, C5 (big finale)
    const melody = [
      { f: 523.25, d: 0.14, t: 0.0 },   // C5
      { f: 523.25, d: 0.14, t: 0.16 },  // C5
      { f: 523.25, d: 0.14, t: 0.32 },  // C5
      { f: 659.25, d: 0.35, t: 0.50 },  // E5
      { f: 587.33, d: 0.18, t: 0.90 },  // D5
      { f: 659.25, d: 0.18, t: 1.10 },  // E5
      { f: 783.99, d: 0.18, t: 1.30 },  // G5
      { f: 1046.5, d: 0.85, t: 1.50 },  // C6 grand finish
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      const start = now + note.t;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + note.d + 0.05);
    });

    // Also add pleasant cheer applause noise
    playCheer(now + 1.2, 0.25);
  } catch (e) {
    console.warn('Fanfare error:', e);
  }
}

/**
 * Synthesize cheerful applause / clapping sound
 */
export function playCheer(startTime?: number, volume = 0.2) {
  try {
    const ctx = getAudioContext();
    const now = startTime ?? ctx.currentTime;
    const duration = 2.0;

    // Buffer noise
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to sound like soft clapping/cheering
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  } catch (e) {
    console.warn('Cheer error:', e);
  }
}

/**
 * Play a cute cheerful chime cue right before speech begins
 */
export function playHappyCue(volume = 0.25) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Cheerful bright two-tone marimba chime (G5 -> C6)
    [783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const start = now + idx * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.25);
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Text-to-Speech Cheerful Voice Assistant (Kak Nadi yang Ceria)
 */
let isSpeakingState = false;

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking || isSpeakingState;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingState = false;
  }
}

export interface SpeakOptions {
  volume?: number;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speakGentle(text: string, options: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel prior utterances
  window.speechSynthesis.cancel();

  // Play a cheerful friendly chime cue before speaking
  playHappyCue(0.2);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID'; // Indonesian
  // Cheerful, lively rate and brighter, friendly pitch for positive child engagement
  utterance.rate = options.rate ?? 1.02; // Lively, energetic pace (not sluggish or dragging)
  utterance.pitch = options.pitch ?? 1.35; // Bright, cheerful, friendly upbeat tone
  utterance.volume = options.volume ?? 1.0;

  // Attempt to select the most cheerful/natural Indonesian voice available
  const voices = window.speechSynthesis.getVoices();
  const idVoice =
    voices.find(v => (v.lang === 'id-ID' || v.lang === 'id_ID') && !v.name.toLowerCase().includes('male')) ||
    voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia')) ||
    voices.find(v => v.lang.startsWith('ms')); // Malay is phonetically very similar as backup

  if (idVoice) {
    utterance.voice = idVoice;
  }

  utterance.onstart = () => {
    isSpeakingState = true;
    options.onStart?.();
  };

  utterance.onend = () => {
    isSpeakingState = false;
    options.onEnd?.();
  };

  utterance.onerror = () => {
    isSpeakingState = false;
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}
