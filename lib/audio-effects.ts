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
      // Ignorujemy błąd, jeśli przeglądarka czeka jeszcze na pierwszy gest użytkownika
    });
  }

  return audioCtx;
}

/**
 * Subtelne, ciepłe stuknięcie drewnianej bierki o szachownicę.
 */
export function playMoveSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Główny oscylator dla rezonansu drewna
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
}

/**
 * Wyraźniejsze, akcentowane uderzenie przy zbijaniu bierki.
 */
export function playCaptureSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dwa nakładające się oscylatory dla wrażenia uderzenia dwóch bierek
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
}

/**
 * Elegancki, dwutonowy dzwonek ostrzegawczy przy szachu.
 */
export function playCheckSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dwa harmonijne tony (A5 -> C#6)
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
}

/**
 * Łagodny, niski ton informujący o nielegalnym posunięciu.
 */
export function playIllegalSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

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
}

/**
 * Subtelny, triumfalny akord przy zakończeniu partii/zwycięstwie.
 */
export function playVictorySound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

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
