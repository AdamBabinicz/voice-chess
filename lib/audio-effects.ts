// lib/audio-effects.ts
/**
 * Proceduralny silnik efektów dźwiękowych dla ChessTactics (Audio Coach).
 * Wykorzystuje Web Audio API do generowania naturalnych, subtelnych dźwięków
 * bierek szachowych bez konieczności pobierania zewnętrznych plików audio.
 */

type SoundType = "move" | "capture" | "check" | "illegal" | "victory";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Jeśli kontekst został uszkodzony przez błąd renderera, zresetuj go
    if (audioCtx && audioCtx.state === "closed") {
      audioCtx = null;
    }

    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {
        // Ignorujemy jeśli przeglądarka czeka na interakcję
      });
    }

    return audioCtx;
  } catch {
    audioCtx = null;
    return null;
  }
}

/**
 * Subtelne, ciepłe stuknięcie drewnianej bierki o szachownicę.
 */
export function playMoveSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Odporność na awarie sterownika audio
  }
}

/**
 * Wyraźniejsze, akcentowane uderzenie przy zbijaniu bierki.
 */
export function playCaptureSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(340, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 0.09);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.09);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.09);
    osc2.stop(now + 0.09);
  } catch {
    // Odporność na awarie sterownika audio
  }
}

/**
 * Elegancki, dwutonowy dzwonek ostrzegawczy przy szachu.
 */
export function playCheckSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const now = ctx.currentTime;
    const tones = [880, 1108.73];

    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + index * 0.06;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  } catch {
    // Odporność na awarie sterownika audio
  }
}

/**
 * Łagodny, niski ton informujący o nielegalnym posunięciu.
 */
export function playIllegalSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // Odporność na awarie sterownika audio
  }
}

/**
 * Subtelny, triumfalny akord przy zakończeniu partii/zwycięstwie.
 */
export function playVictorySound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5];

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch {
    // Odporność na awarie sterownika audio
  }
}

/**
 * Główny dyspozytor dźwięków według typu zdarzenia.
 */
export function playChessSound(type: SoundType): void {
  switch (type) {
    case "move":
      playMoveSound();
      break;
    case "capture":
      playCaptureSound();
      break;
    case "check":
      playCheckSound();
      break;
    case "illegal":
      playIllegalSound();
      break;
    case "victory":
      playVictorySound();
      break;
  }
}
