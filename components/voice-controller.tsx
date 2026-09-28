// components/voice-controller.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceControllerProps {
  lang: "en" | "pl";
  voiceMode: "continuous" | "push";
  isSpeaking?: boolean;
  onMoveParsed: (move: string) => void;
  labels: {
    listeningText: string;
    startVoiceText: string;
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

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang === "pl" ? "pl-PL" : "en-US";

    recognition.onresult = (event: any) => {
      // KLUCZOWE: Jeśli lektor właśnie mówi z głośników, ignorujemy echo!
      if (isSpeakingRef.current) {
        return;
      }

      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript
        .trim()
        .toLowerCase();
      const parsed = parseSpokenMove(transcript, lang);

      if (parsed) {
        onMoveParsed(parsed);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignoruj
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignoruj
        }
      }
    };
  }, [lang, onMoveParsed]);

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignoruj
      }
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch {
        // Ignoruj
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed =
      parseSpokenMove(manualInput.trim().toLowerCase(), lang) ||
      manualInput.trim();
    onMoveParsed(parsed);
    setManualInput("");
  };

  const speakingMuteLabel =
    lang === "pl"
      ? "Lektor mówi... (mikrofon wyciszony)"
      : "Coach speaking... (mic muted)";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#dfe5dc] bg-white p-4 shadow-sm dark:border-[#29332e] dark:bg-[#18201b] sm:flex-row sm:items-center">
      {speechSupported ? (
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
            isListening
              ? "bg-rose-600 text-white shadow-md animate-pulse hover:bg-rose-700"
              : "bg-[#17201c] text-white hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-[#17201c] dark:hover:bg-[#b8de53]"
          }`}
          aria-label={
            isListening ? labels.listeningText : labels.startVoiceText
          }
        >
          {isListening ? (
            <>
              <MicOff className="size-4 animate-bounce" />
              <span>
                {isSpeaking ? speakingMuteLabel : labels.listeningText}
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

      {/* Dostępne pole wpisywania ruchu */}
      <form
        onSubmit={handleManualSubmit}
        className="flex flex-1 items-center gap-2"
      >
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder={labels.inputPlaceholder}
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

function parseSpokenMove(text: string, lang: "en" | "pl"): string | null {
  const clean = text
    .toLowerCase()
    .replace(/[.,!?;:"'„”]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Roszady (obsługa słowna oraz wariantów 0-0 i O-O)
  if (
    clean === "0-0-0" ||
    clean === "000" ||
    clean === "o-o-o" ||
    clean === "ooo" ||
    clean.includes("długa roszada") ||
    clean.includes("dluga roszada") ||
    clean.includes("long castle") ||
    clean.includes("queenside castle") ||
    clean.includes("queen side castle")
  ) {
    return "O-O-O";
  }

  if (
    clean === "0-0" ||
    clean === "00" ||
    clean === "o-o" ||
    clean === "oo" ||
    clean.includes("krótka roszada") ||
    clean.includes("krotka roszada") ||
    clean.includes("roszada") ||
    clean.includes("roszadę") ||
    clean.includes("roszade") ||
    clean.includes("kingside castle") ||
    clean.includes("king side castle") ||
    clean.includes("short castle") ||
    clean.includes("castle")
  ) {
    return "O-O";
  }

  // 2. Liczby słowne
  const plNumbers: Record<string, string> = {
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
  };

  // 3. Fonetyczne nazwy liter kolumn w języku polskim
  const plLetters: Record<string, string> = {
    a: "a",
    be: "b",
    ce: "c",
    de: "d",
    e: "e",
    ef: "f",
    gie: "g",
    ha: "h",
  };

  const words = clean.split(" ");
  const normalizedWords = words.map((w) => plNumbers[w] || plLetters[w] || w);
  const normalizedText = normalizedWords.join(" ");

  // 4. Figury
  let piecePrefix = "";
  if (
    normalizedText.includes("skoczek") ||
    normalizedText.includes("skoczka") ||
    normalizedText.includes("koń") ||
    normalizedText.includes("kon") ||
    normalizedText.includes("konia") ||
    normalizedText.includes("knight")
  ) {
    piecePrefix = "N";
  } else if (
    normalizedText.includes("goniec") ||
    normalizedText.includes("gońca") ||
    normalizedText.includes("gonca") ||
    normalizedText.includes("bishop")
  ) {
    piecePrefix = "B";
  } else if (
    normalizedText.includes("wieża") ||
    normalizedText.includes("wieza") ||
    normalizedText.includes("wieżę") ||
    normalizedText.includes("wieze") ||
    normalizedText.includes("wiezy") ||
    normalizedText.includes("wieży") ||
    normalizedText.includes("rook")
  ) {
    piecePrefix = "R";
  } else if (
    normalizedText.includes("hetman") ||
    normalizedText.includes("hetmana") ||
    normalizedText.includes("królowa") ||
    normalizedText.includes("krolowa") ||
    normalizedText.includes("królową") ||
    normalizedText.includes("krolowe") ||
    normalizedText.includes("queen")
  ) {
    piecePrefix = "Q";
  } else if (
    normalizedText.includes("król") ||
    normalizedText.includes("krol") ||
    normalizedText.includes("króla") ||
    normalizedText.includes("krola") ||
    normalizedText.includes("king")
  ) {
    piecePrefix = "K";
  }

  const isCapture =
    normalizedText.includes("bije") ||
    normalizedText.includes("zbija") ||
    normalizedText.includes("zbij") ||
    normalizedText.includes("takes") ||
    normalizedText.includes("bicia") ||
    normalizedText.includes("bicie");

  // Szukamy zapisu pola, np. "e4", "e 4", "f3", "c 6"
  const squareMatch = normalizedText.match(/\b([a-h])\s?([1-8])\b/);
  if (squareMatch) {
    const targetSquare = `${squareMatch[1]}${squareMatch[2]}`;

    if (piecePrefix) {
      return isCapture
        ? `${piecePrefix}x${targetSquare}`
        : `${piecePrefix}${targetSquare}`;
    }

    // Bicie pionem, np. "e bije d5" -> "exd5"
    const fromColMatch = normalizedText.match(
      /\b([a-h])\s*(bije|zbija|takes|x)?\s*[a-h][1-8]\b/,
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
