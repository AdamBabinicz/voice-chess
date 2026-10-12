// components/voice-controller.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceControllerProps {
  lang: "en" | "pl";
  voiceMode: "continuous" | "push";
  isSpeaking?: boolean;
  onMoveParsed: (move: any) => void;
  labels: {
    listeningText: string;
    startVoiceText: string;
    speakingMuted: string;
    inputPlaceholder: string;
    submitMoveText: string;
    unsupportedSpeech: string;
    speechError: string;
    unrecognizedMove: string;
  };
}

export function VoiceController({
  lang,
  voiceMode,
  isSpeaking = false,
  onMoveParsed,
  labels,
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const userWantsListeningRef = useRef(false);

  // Stabilna referencja dla onMoveParsed zapobiega pętli restartowania mikrofonu
  const onMoveParsedRef = useRef(onMoveParsed);
  useEffect(() => {
    onMoveParsedRef.current = onMoveParsed;
  }, [onMoveParsed]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;

    // Gdy lektor mówi, pauzujemy nasłuch, aby nie zbierać echa z głośników
    if (isSpeaking) {
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    } else {
      // Wznawiamy nasłuch po zakończeniu mowy lektora
      if (userWantsListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch {}
      }
    }
  }, [isSpeaking]);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = voiceMode === "continuous";
    recognition.interimResults = false;
    recognition.lang = lang === "pl" ? "pl-PL" : "en-US";

    recognition.onresult = (event: any) => {
      if (recognitionRef.current !== recognition) return;
      if (isSpeakingRef.current) return;

      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript
        .trim()
        .toLowerCase();

      const parsed = parseSpokenMove(transcript, lang);

      // Log w konsoli przeglądarki (F12 -> Console) ułatwiający weryfikację mowy
      console.log(
        `[Chess Voice (${lang})] Heard: "${transcript}" -> Parsed:`,
        parsed,
      );

      if (parsed) {
        onMoveParsedRef.current(parsed);
      }
    };

    recognition.onerror = (event: any) => {
      if (recognitionRef.current !== recognition) return;
      if (event.error === "no-speech" || event.error === "aborted") return;

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "audio-capture"
      ) {
        userWantsListeningRef.current = false;
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;

      if (userWantsListeningRef.current && !isSpeakingRef.current) {
        try {
          recognition.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else if (!userWantsListeningRef.current) {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    return recognition;
  }, [lang, voiceMode]); // Celowo bez onMoveParsed, aby nie restartować mikrofonu przy każdym renderze

  useEffect(() => {
    const rec = initRecognition();
    recognitionRef.current = rec;

    if (userWantsListeningRef.current && !isSpeakingRef.current && rec) {
      try {
        rec.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch {}
    }

    return () => {
      if (rec) {
        try {
          rec.abort();
        } catch {}
      }
    };
  }, [initRecognition]);

  const toggleListening = () => {
    if (!speechSupported) return;

    if (userWantsListeningRef.current) {
      userWantsListeningRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current?.abort();
      } catch {}
    } else {
      userWantsListeningRef.current = true;
      if (!isSpeakingRef.current) {
        isListeningRef.current = true;
        setIsListening(true);
        try {
          recognitionRef.current?.start();
        } catch {
          userWantsListeningRef.current = false;
          isListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(true);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed =
      parseSpokenMove(manualInput.trim().toLowerCase(), lang) ||
      manualInput.trim();
    onMoveParsedRef.current(parsed);
    setManualInput("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#dfe5dc] bg-white p-4 shadow-sm dark:border-[#29332e] dark:bg-[#18201b] sm:flex-row sm:items-center">
      {speechSupported ? (
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
            isListening
              ? isSpeaking
                ? "bg-amber-600 text-white shadow-md hover:bg-amber-700"
                : "bg-rose-600 text-white shadow-md animate-pulse hover:bg-rose-700"
              : "bg-[#17201c] text-white hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-[#17201c] dark:hover:bg-[#b8de53]"
          }`}
          aria-label={
            isListening ? labels.listeningText : labels.startVoiceText
          }
        >
          {isListening ? (
            <>
              <MicOff className="size-4" />
              <span>
                {isSpeaking ? labels.speakingMuted : labels.listeningText}
              </span>
            </>
          ) : (
            <>
              <Mic className="size-4" />
              <span>{labels.startVoiceText}</span>
            </>
          )}
        </button>
      ) : (
        <span className="text-xs text-rose-600 dark:text-rose-400">
          {labels.unsupportedSpeech}
        </span>
      )}

      {/* Formularz tekstowy */}
      <form
        onSubmit={handleManualSubmit}
        className="flex flex-1 items-center gap-2"
      >
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder={labels.inputPlaceholder}
          aria-label={labels.inputPlaceholder}
          className="flex-1 rounded-xl border border-[#dce5d8] bg-[#f8faf7] px-3.5 py-2.5 text-xs text-[#17201c] placeholder:text-[#88958d] focus:border-[#789b35] focus:outline-none dark:border-[#2f3d33] dark:bg-[#202b25] dark:text-[#edf2ed] dark:placeholder:text-[#6f7e75]"
        />
        <Button
          type="submit"
          className="rounded-xl border border-[#17201c] bg-[#17201c] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#2c3d33] hover:border-[#2c3d33] active:scale-[0.98] dark:border-[#2f3d33] dark:bg-[#202b25] dark:text-[#edf2ed] dark:hover:bg-[#283830] dark:hover:text-white cursor-pointer"
        >
          <Send className="mr-1.5 size-3.5 text-white dark:text-[#edf2ed]" />
          <span>{labels.submitMoveText}</span>
        </Button>
      </form>
    </div>
  );
}

function parseSpokenMove(text: string, lang: "en" | "pl"): any {
  // Usuwanie interpunkcji ORAZ myślników (zamiana myślnika na spację rozbija "e-4" na "e 4")
  let clean = text
    .toLowerCase()
    .replace(/[-.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 0. Komendy poddania się
  if (
    clean === "poddaje sie" ||
    clean === "poddaję się" ||
    clean.includes("poddaje sie") ||
    clean.includes("poddaję się") ||
    clean.includes("poddaje partie") ||
    clean.includes("poddaję partię") ||
    clean.includes("rezygnuje") ||
    clean.includes("rezygnuję") ||
    clean === "resign" ||
    clean.includes("i resign") ||
    clean.includes("surrender") ||
    clean.includes("give up")
  ) {
    return "RESIGN";
  }

  // 1. Roszady
  if (
    clean === "0-0-0" ||
    clean === "o-o-o" ||
    clean.includes("długa roszada") ||
    clean.includes("dluga roszada") ||
    clean.includes("long castle") ||
    clean.includes("castle long") ||
    clean.includes("queenside") ||
    clean.includes("queen side")
  ) {
    return "O-O-O";
  }

  if (
    clean === "0-0" ||
    clean === "o-o" ||
    clean.includes("roszada") ||
    clean.includes("roszadę") ||
    clean.includes("krótka roszada") ||
    clean.includes("krotka roszada") ||
    clean.includes("short castle") ||
    clean.includes("castle short") ||
    clean.includes("castle") ||
    clean.includes("castling") ||
    clean.includes("kingside") ||
    clean.includes("king side")
  ) {
    return "O-O";
  }

  // 2. Angielskie homofony całych fraz ruchów (np. "before" -> "b4")
  clean = clean.replace(/\bbefore\b/g, "b 4");

  // 3. Normalizacja "to" / "two" po literze kolumny (np. "e to" -> "e 2", "c two" -> "c 2")
  clean = clean.replace(/\b([a-h])\s+(?:to|two|too)\b/g, "$1 2");

  // Usuwanie zbędnych słów łączących (np. "knight to f3" -> "knight f3", "pawn to e4" -> "pawn e4")
  clean = clean.replace(/\b(?:to|into|towards|na|do|pole|square)\b/g, " ");

  // 4. Słowniki liczb i fonetycznych liter
  const numbersMap: Record<string, string> = {
    jeden: "1",
    dwa: "2",
    trzy: "3",
    cztery: "4",
    pięć: "5",
    piec: "5",
    sześć: "6",
    szesc: "6",
    siedem: "7",
    osiem: "8",
    one: "1",
    won: "1",
    two: "2",
    too: "2",
    three: "3",
    tree: "3",
    four: "4",
    for: "4",
    fore: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    ate: "8",
  };

  const lettersMap: Record<string, string> = {
    a: "a",
    be: "b",
    ce: "c",
    de: "d",
    e: "e",
    ef: "f",
    gie: "g",
    ha: "h",
    ay: "a",
    bee: "b",
    sea: "c",
    see: "c",
    dee: "d",
    gee: "g",
    aitch: "h",
  };

  const words = clean.split(" ");
  const normalizedWords = words.map((w) => {
    if (numbersMap[w]) return numbersMap[w];
    if (lettersMap[w]) return lettersMap[w];
    return w;
  });
  const normalizedText = normalizedWords.join(" ");

  // 5. Rozpoznawanie figur
  let piecePrefix = "";
  if (
    normalizedText.includes("skoczek") ||
    normalizedText.includes("koń") ||
    normalizedText.includes("kon") ||
    normalizedText.includes("knight") ||
    normalizedText.includes("night") ||
    normalizedText.includes("nite") ||
    normalizedText.includes("horse")
  ) {
    piecePrefix = "N";
  } else if (
    normalizedText.includes("goniec") ||
    normalizedText.includes("bishop")
  ) {
    piecePrefix = "B";
  } else if (
    normalizedText.includes("wieża") ||
    normalizedText.includes("wieza") ||
    normalizedText.includes("rook")
  ) {
    piecePrefix = "R";
  } else if (
    normalizedText.includes("hetman") ||
    normalizedText.includes("królowa") ||
    normalizedText.includes("krolowa") ||
    normalizedText.includes("queen")
  ) {
    piecePrefix = "Q";
  } else if (
    normalizedText.includes("król") ||
    normalizedText.includes("krol") ||
    normalizedText.includes("king")
  ) {
    piecePrefix = "K";
  }

  // 6. Bicia
  const isCapture =
    normalizedText.includes("bije") ||
    normalizedText.includes("zbija") ||
    normalizedText.includes("bicia") ||
    normalizedText.includes("takes") ||
    normalizedText.includes("take") ||
    normalizedText.includes("captures") ||
    normalizedText.includes("capture");

  // 7. Dopasowanie ruchu dwupolowego (np. "e2 e4", "e2 to e4") -> Zwraca bezpieczny obiekt { from, to }
  const twoSquareMatch = normalizedText.match(
    /\b([a-h][1-8])\s*(?:x|bije|takes)?\s*([a-h][1-8])\b/,
  );
  if (twoSquareMatch) {
    const fromSquare = twoSquareMatch[1];
    const toSquare = twoSquareMatch[2];
    if (fromSquare !== toSquare) {
      if (piecePrefix) {
        return isCapture
          ? `${piecePrefix}x${toSquare}`
          : `${piecePrefix}${toSquare}`;
      }
      return { from: fromSquare, to: toSquare };
    }
  }

  // 8. Bezpośredni zapis SAN (np. "nf3", "qh5", "bxc4")
  const directSanMatch = normalizedText.match(
    /\b([nbrqk])\s*(x)?\s*([a-h][1-8])\b/,
  );
  if (directSanMatch) {
    const piece = directSanMatch[1].toUpperCase();
    const cap = directSanMatch[2] ? "x" : "";
    const sq = directSanMatch[3];
    return `${piece}${cap}${sq}`;
  }

  // 9. Standardowe dopasowanie pojedynczego pola docelowego
  const squareMatch = normalizedText.match(/\b([a-h])\s?([1-8])\b/);
  if (squareMatch) {
    const targetSquare = `${squareMatch[1]}${squareMatch[2]}`;

    if (piecePrefix) {
      return isCapture
        ? `${piecePrefix}x${targetSquare}`
        : `${piecePrefix}${targetSquare}`;
    }

    // Bicie pionem (np. "e takes d5" -> "exd5")
    const fromColMatch = normalizedText.match(
      /\b([a-h])\s*(?:bije|zbija|takes|take|captures|capture|x)?\s*[a-h][1-8]\b/,
    );
    if (fromColMatch && fromColMatch[1] !== squareMatch[1]) {
      return `${fromColMatch[1]}x${targetSquare}`;
    }

    if (isCapture) {
      return `x${targetSquare}`;
    }

    return targetSquare;
  }

  return null;
}
