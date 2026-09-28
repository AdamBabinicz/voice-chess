// app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  AudioLines,
  ChevronRight,
  EyeOff,
  Headphones,
  Loader2,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Chess, Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { ChessBoardView } from "@/components/chess-board-view";
import { VoiceController } from "@/components/voice-controller";
import { SettingsModal } from "@/components/settings-modal";
import { LegalModal } from "@/components/legal-modal";
import { SiteHeader } from "@/components/site-header";
import { TacticsSection } from "@/components/tactics-section";
import {
  calculateMaterialBalance,
  evaluateTacticalPuzzle,
  findBestEngineMove,
  generateBlindfoldStatus,
  generateCoachInsight,
  MaterialScore,
  TACTICAL_PUZZLES,
} from "@/lib/chess-coach-engine";
import {
  playCaptureSound,
  playCheckSound,
  playIllegalSound,
  playMoveSound,
  playVictorySound,
} from "@/lib/audio-effects";
import { Lang, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

type LegalType = "privacy" | "terms" | null;

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("pl");
  const [dark, setDark] = useState(false);
  const [blind, setBlind] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [settings, setSettings] = useState(false);
  const [legal, setLegal] = useState<LegalType>(null);
  const [cookies, setCookies] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [speed, setSpeed] = useState("1");
  const [voiceMode, setVoiceMode] = useState<"continuous" | "push">("push");
  const [coachInsight, setCoachInsight] = useState("");
  const [coachMuted, setCoachMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState<number | null>(null);

  const [gameInstance] = useState(() => new Chess());
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [board, setBoard] = useState(() => gameInstance.board());
  const [material, setMaterial] = useState<MaterialScore>({
    score: 0,
    whiteMaterial: 39,
    blackMaterial: 39,
    display: "0",
    evalText: "Równowaga materialna.",
  });

  const lastValidCoachInsightRef = useRef<string>("");
  const pendingBotInsightRef = useRef<{
    insight: string;
    audioText: string;
  } | null>(null);
  const isPlayingPlayerAudioRef = useRef(false);

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    const defaultText = translations[lang].defaultCoachText;
    setCoachInsight(defaultText);
    lastValidCoachInsightRef.current = defaultText;

    const onScroll = () => {
      setShowTop(window.scrollY > 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const acceptCookies = () => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cookie_consent_accepted" });
    }
    setCookies(false);
  };

  /**
   * Płynna synteza mowy z obsługą kolejkowania, wyciszenia i blokadą mikrofonu
   */
  const announce = (message: string, onComplete?: () => void) => {
    if (coachMuted) {
      if (onComplete) onComplete();
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = lang === "pl" ? "pl-PL" : "en-US";
        utterance.rate = Number(speed);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          if (onComplete) onComplete();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          if (onComplete) onComplete();
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        if (onComplete) onComplete();
      }
    } else {
      if (onComplete) onComplete();
    }
  };

  const speakBlindfoldStatus = () => {
    const statusText = generateBlindfoldStatus(gameInstance, lang);
    setCoachInsight(statusText);
    lastValidCoachInsightRef.current = statusText;
    announce(statusText);
  };

  /**
   * Głęboka analiza pozycji przez model AI / Arcymistrza
   */
  const handleDeepAiAnalysis = async () => {
    if (isAnalyzingAi) return;
    setIsAnalyzingAi(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: gameInstance.fen(),
          history: gameInstance.history(),
          lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.insight) {
          setCoachInsight(data.insight);
          lastValidCoachInsightRef.current = data.insight;
          announce(data.audioText || data.insight);
        }
      }
    } catch {
      // Ignoruj błąd sieciowy
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  /**
   * Silnik odpowiedzi bota szachowego z obsługą poziomów Beginner / Intermediate / Master
   * Wykonuje ruch fizycznie na planszy, a komentarz trenera odtwarza po zakończeniu mowy o ruchu gracza
   */
  const executeComputerResponse = () => {
    if (gameInstance.isGameOver()) return;

    try {
      const bestMove = findBestEngineMove(gameInstance, difficulty);
      if (!bestMove) return;

      const reply = gameInstance.move(bestMove);
      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([...gameInstance.history()]);
      setMaterial(calculateMaterialBalance(gameInstance, lang));

      // Efekt dźwiękowy dla ruchu komputera
      if (gameInstance.isCheckmate()) {
        playVictorySound();
      } else if (gameInstance.inCheck()) {
        playCheckSound();
      } else if (reply.captured) {
        playCaptureSound();
      } else {
        playMoveSound();
      }

      const replyAnalysis = generateCoachInsight(
        gameInstance,
        reply,
        lang,
        false,
      );

      // Jeśli lektor wciąż mówi o ruchu gracza, kolejka poczeka z komentarzem bota
      if (isPlayingPlayerAudioRef.current) {
        pendingBotInsightRef.current = replyAnalysis;
      } else {
        setCoachInsight(replyAnalysis.insight);
        lastValidCoachInsightRef.current = replyAnalysis.insight;
        announce(replyAnalysis.audioText);
      }
    } catch {
      // Ignoruj błąd
    }
  };

  const applyMove = (notation: string | { from: string; to: string }) => {
    try {
      let finalMove: any = notation;

      // Inteligentne dopasowanie bicia jeśli podano "x..." lub bicie na dane pole
      if (typeof finalMove === "string") {
        const cleanStr = finalMove.trim();
        if (cleanStr.startsWith("x")) {
          const targetSquare = cleanStr.slice(1);
          const legalMoves = gameInstance.moves({ verbose: true });
          const capture = legalMoves.find(
            (m) => m.to === targetSquare && m.captured,
          );
          if (capture) {
            finalMove = capture.san;
          }
        }
      }

      const result =
        typeof finalMove === "string"
          ? gameInstance.move(finalMove, { strict: false })
          : gameInstance.move({ ...finalMove, promotion: "q" });

      if (!result) {
        throw new Error("Invalid move");
      }

      // Efekt dźwiękowy dla wykonanego ruchu
      if (gameInstance.isCheckmate()) {
        playVictorySound();
      } else if (gameInstance.inCheck()) {
        playCheckSound();
      } else if (result.captured) {
        playCaptureSound();
      } else {
        playMoveSound();
      }

      const updatedBoard = [...gameInstance.board()];
      setBoard(updatedBoard);
      setTurn(gameInstance.turn());
      setMoves([...gameInstance.history()]);
      setSelected(null);
      setMaterial(calculateMaterialBalance(gameInstance, lang));

      if (activePuzzle !== null) {
        const puzzleCheck = evaluateTacticalPuzzle(
          activePuzzle,
          result.san,
          lang,
        );
        setCoachInsight(puzzleCheck.insight);
        lastValidCoachInsightRef.current = puzzleCheck.insight;

        if (puzzleCheck.isCorrect) {
          playVictorySound();
          setActivePuzzle(null);
        }

        announce(puzzleCheck.audioText);
        return;
      }

      // 1. Analiza ruchu gracza
      const playerAnalysis = generateCoachInsight(
        gameInstance,
        result,
        lang,
        true,
      );
      setCoachInsight(playerAnalysis.insight);
      lastValidCoachInsightRef.current = playerAnalysis.insight;

      // Oznaczamy, że lektor mówi o ruchu gracza
      isPlayingPlayerAudioRef.current = true;
      pendingBotInsightRef.current = null;

      announce(playerAnalysis.audioText, () => {
        isPlayingPlayerAudioRef.current = false;
        // Gdy skończy mówić o ruchu gracza, jeśli bot zdążył przygotować odpowiedź, odtwórz ją teraz!
        if (pendingBotInsightRef.current) {
          const botAnalysis = pendingBotInsightRef.current;
          pendingBotInsightRef.current = null;
          setCoachInsight(botAnalysis.insight);
          lastValidCoachInsightRef.current = botAnalysis.insight;
          announce(botAnalysis.audioText);
        }
      });

      // Wykonaj ruch bota z małym opóźnieniem naturalnym
      window.setTimeout(() => {
        executeComputerResponse();
      }, 700);
    } catch {
      // Dźwięk błędu przy próbie nielegalnego ruchu
      playIllegalSound();

      const err =
        lang === "pl"
          ? "To posunięcie jest niedozwolone w tej pozycji."
          : "Illegal move. Please try another move.";
      setCoachInsight(err);

      window.setTimeout(() => {
        if (lastValidCoachInsightRef.current) {
          setCoachInsight(lastValidCoachInsightRef.current);
        }
      }, 2200);
    }
  };

  /**
   * Obsługa kliknięcia pola na szachownicy:
   * - kliknięcie własnej bierki natychmiast ją wybiera (bez potrzeby odklikiwania poprzedniej!)
   * - powtórne kliknięcie tej samej bierki odznacza ją
   * - kliknięcie docelowego pola próbuje wykonać ruch
   */
  const handleSquareClick = (i: number) => {
    const rowIndex = Math.floor(i / 8);
    const columnIndex = i % 8;
    const clickedSquare =
      `${String.fromCharCode(97 + columnIndex)}${8 - rowIndex}` as Square;
    const clickedPiece = board[rowIndex][columnIndex];

    if (selected === null) {
      if (clickedPiece && clickedPiece.color === gameInstance.turn()) {
        setSelected(i);
      }
    } else {
      const fromRow = Math.floor(selected / 8);
      const fromCol = selected % 8;
      const fromSquare = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`;

      // 1. Kliknięcie w to samo pole odznacza je
      if (fromSquare === clickedSquare) {
        setSelected(null);
        return;
      }

      // 2. Kliknięcie w inną własną bierkę natychmiast przestawia zaznaczenie
      if (clickedPiece && clickedPiece.color === gameInstance.turn()) {
        setSelected(i);
        return;
      }

      // 3. W innym wypadku próbujemy wykonać ruch z zaznaczonego pola na kliknięte
      applyMove({ from: fromSquare, to: clickedSquare });
    }
  };

  const newGame = () => {
    gameInstance.reset();
    setBoard([...gameInstance.board()]);
    setTurn(gameInstance.turn());
    setMoves([]);
    setSelected(null);
    setActivePuzzle(null);
    setMaterial(calculateMaterialBalance(gameInstance, lang));
    playMoveSound();

    const displayText =
      lang === "pl"
        ? "Rozpoczynamy nową partię! Wypowiedz swój ruch otwarcia."
        : "Starting fresh game! Speak your opening move.";
    setCoachInsight(displayText);
    lastValidCoachInsightRef.current = displayText;

    const audioText =
      lang === "pl"
        ? "Rozpoczynamy nową rozgrywkę! Wypowiedz swój ruch otwarcia."
        : displayText;

    announce(audioText);
    scrollToSection("live-coach");
  };

  const undoMove = () => {
    try {
      const history = gameInstance.history();
      if (history.length === 0) return;

      gameInstance.undo();
      if (history.length >= 2 && activePuzzle === null) {
        gameInstance.undo();
      }

      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([...gameInstance.history()]);
      setSelected(null);
      setMaterial(calculateMaterialBalance(gameInstance, lang));
      playMoveSound();

      const undoText =
        lang === "pl"
          ? "Cofnięto ruch. Wybierz inne posunięcie."
          : "Move undone. Choose another move.";
      setCoachInsight(undoText);
      lastValidCoachInsightRef.current = undoText;
      announce(undoText);
    } catch {
      // Ignoruj
    }
  };

  const loadPuzzle = (index: number) => {
    const puzzle = TACTICAL_PUZZLES[index];
    if (!puzzle) return;

    try {
      gameInstance.load(puzzle.fen);
      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([]);
      setSelected(null);
      setActivePuzzle(index);
      setMaterial(calculateMaterialBalance(gameInstance, lang));
      playMoveSound();

      const hint = puzzle.hint[lang];
      setCoachInsight(hint);
      lastValidCoachInsightRef.current = hint;
      announce(hint);
      scrollToSection("live-coach");
    } catch {
      // Ignoruj
    }
  };

  const scrollToSection = (id: string) => {
    if (typeof document !== "undefined") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f7f8f5] text-[#17201c] transition-colors",
        dark && "dark bg-[#111613] text-[#edf2ed]",
      )}
    >
      <SiteHeader
        lang={lang}
        onToggleLang={() => setLang(lang === "en" ? "pl" : "en")}
        dark={dark}
        onToggleDark={() => setDark(!dark)}
        onOpenSettings={() => setSettings(true)}
        onNewGame={newGame}
        onScrollTo={scrollToSection}
        subline={t.subline}
        navItems={t.nav}
        settingsLabel={t.settings}
      />

      <main id="top">
        <section className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-24 lg:pt-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/30 bg-[#eaf4d5] px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-[#2d4e13] dark:bg-[#1f2d22] dark:text-[#bcee68]">
              <span className="size-2 rounded-full bg-[#365314] animate-pulse" />
              {t.eyebrow}
            </div>

            <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              {t.title}
              <br />
              <span className="text-[#2d4e13] dark:text-[#bcee68]">
                {t.accent}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base sm:text-lg leading-relaxed text-[#3c4a41] dark:text-[#cbd5e1]">
              {t.body}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                className="h-12 rounded-xl bg-[#17201c] px-6 font-semibold text-white shadow-md hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-[#17201c] dark:hover:bg-[#b8de53] cursor-pointer"
                onClick={() => scrollToSection("live-coach")}
              >
                <Play className="mr-2 size-4 fill-current" />
                {t.start}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-12 rounded-xl text-[#3c4a41] hover:text-[#17201c] dark:text-[#cbd5e1] dark:hover:text-white cursor-pointer"
                onClick={() => scrollToSection("tactics")}
              >
                {t.explore}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-[#dfe5dc] pt-6 dark:border-[#29332e]">
              <div>
                <strong className="font-serif text-2xl font-bold">12</strong>
                <p className="mt-1 text-xs font-semibold text-[#424e46] dark:text-[#cbd5e1]">
                  {t.streak}
                </p>
              </div>
              <div>
                <strong className="font-serif text-2xl font-bold">1,247</strong>
                <p className="mt-1 text-xs font-semibold text-[#424e46] dark:text-[#cbd5e1]">
                  {t.rating}
                </p>
              </div>
              <div>
                <strong className="font-serif text-2xl font-bold">38</strong>
                <p className="mt-1 text-xs font-semibold text-[#424e46] dark:text-[#cbd5e1]">
                  {t.sessions}
                </p>
              </div>
            </div>
          </div>

          {/* Karta szachownicy */}
          <div
            id="live-coach"
            className="rounded-[2rem] border border-[#dce5d8] bg-white p-4 shadow-[0_20px_60px_-20px_rgba(52,73,57,.2)] dark:border-[#2b3a30] dark:bg-[#18201b] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between text-xs font-bold tracking-[0.15em] text-[#2d4e13] dark:text-[#bcee68]">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#2d4e13] dark:bg-[#bcee68] animate-ping" />
                {t.live}{" "}
                {activePuzzle !== null &&
                  TACTICAL_PUZZLES[activePuzzle] &&
                  `· ${TACTICAL_PUZZLES[activePuzzle].title[lang]}`}
              </span>
              <span className="text-[#3c4a41] dark:text-[#cbd5e1] font-semibold">
                {turn === "w" ? t.turnWhite : t.turnBlack}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
              <ChessBoardView
                board={board}
                selectedSquare={selected}
                onSquareClick={handleSquareClick}
                blindfold={blind}
                labels={{
                  blind: t.blind,
                  peek: t.peek,
                  hint: t.hint,
                  blindfoldDesc: t.blindfoldDesc,
                }}
              />

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-[#d8e2d4] bg-[#f1f5ed] p-4 dark:border-[#2f3d33] dark:bg-[#202b25]">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#2d4e13] dark:text-[#bcee68]">
                    <span className="flex items-center gap-1.5">
                      <AudioLines className="size-4" />
                      {t.coach}
                    </span>
                    <div className="flex items-center gap-2">
                      {isSpeaking && (
                        <span className="flex gap-0.5">
                          <span className="size-1 rounded-full bg-[#2d4e13] dark:bg-[#bcee68] animate-ping" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!coachMuted && typeof window !== "undefined") {
                            window.speechSynthesis?.cancel();
                            setIsSpeaking(false);
                          }
                          setCoachMuted(!coachMuted);
                        }}
                        title={coachMuted ? t.unmuteCoach : t.muteCoach}
                        aria-label={coachMuted ? t.unmuteCoach : t.muteCoach}
                        className="rounded-lg p-1 text-[#2d4e13] hover:bg-[#dfead1] dark:text-[#bcee68] dark:hover:bg-[#2b3a30] transition-colors cursor-pointer"
                      >
                        {coachMuted ? (
                          <VolumeX className="size-3.5 text-stone-400 dark:text-stone-500" />
                        ) : (
                          <Volume2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="font-serif text-sm italic leading-relaxed text-[#2a362f] dark:text-[#e2e8f0]">
                    &ldquo;{coachInsight}&rdquo;
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => announce(coachInsight)}
                      disabled={coachMuted}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#2d4e13] disabled:opacity-40 dark:text-[#bcee68] hover:underline cursor-pointer"
                    >
                      {isSpeaking ? (
                        <VolumeX className="size-4" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                      <span>{t.replay}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeepAiAnalysis}
                      disabled={isAnalyzingAi}
                      className="flex items-center gap-1.5 rounded-lg border border-[#365314]/30 bg-[#c8ee63]/30 px-2.5 py-1 text-[11px] font-bold text-[#1f3708] hover:bg-[#c8ee63]/50 disabled:opacity-50 dark:border-[#a8d655]/40 dark:bg-[#a8d655]/20 dark:text-[#bced6b] dark:hover:bg-[#a8d655]/40 transition-colors cursor-pointer"
                    >
                      {isAnalyzingAi ? (
                        <Loader2 className="size-3 animate-spin text-[#2d4e13]" />
                      ) : (
                        <Sparkles className="size-3 text-[#2d4e13] dark:text-[#bcee68]" />
                      )}
                      <span>
                        {isAnalyzingAi ? t.aiAnalyzing : t.aiAnalysisBtn}
                      </span>
                    </button>

                    {blind && (
                      <button
                        type="button"
                        onClick={speakBlindfoldStatus}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-800 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white cursor-pointer"
                      >
                        <Headphones className="size-3.5 text-[#2d4e13] dark:text-[#bcee68]" />
                        <span>{t.statusAudio}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs font-bold text-[#3c4a41] dark:text-[#cbd5e1]">
                    <span>
                      {t.moves} ({moves.length} ply)
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold font-mono transition-colors",
                        material.score > 0
                          ? "bg-emerald-200 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : material.score < 0
                            ? "bg-amber-200 text-amber-950 dark:bg-amber-950/80 dark:text-amber-300"
                            : "bg-[#d8e6be] text-[#23380e] dark:bg-[#29382b] dark:text-[#bcee68]",
                      )}
                    >
                      {material.score > 0
                        ? `${lang === "pl" ? "Białe" : "White"} ${material.display}`
                        : material.score < 0
                          ? `${lang === "pl" ? "Czarne" : "Black"} ${material.display}`
                          : lang === "pl"
                            ? "Równe (0)"
                            : "Equal (0)"}
                    </span>
                  </div>
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-[#d8e2d4] bg-[#fbfcfa] p-3 font-mono text-xs dark:border-[#334238] dark:bg-[#1b251e]">
                    {moves.length ? (
                      moves.map((m, i) => (
                        <span
                          key={`${m}-${i}`}
                          className={cn(
                            "rounded px-1 py-0.5",
                            i % 2 === 0
                              ? "font-bold text-stone-950 dark:text-stone-50"
                              : "text-stone-700 dark:text-stone-300",
                          )}
                        >
                          {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="font-sans text-[#424e46] dark:text-[#cbd5e1]">
                        {t.listen}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={undoMove}
                    disabled={moves.length === 0}
                    className="flex-1 rounded-xl border border-stone-400 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {t.undoBtn}
                  </button>
                  <button
                    type="button"
                    onClick={newGame}
                    className="flex-1 rounded-xl bg-stone-950 py-1.5 text-xs font-bold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 transition-colors cursor-pointer"
                  >
                    {t.newGameBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Stopka szachownicy */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8e2d4] pt-4 text-xs font-semibold text-[#3c4a41] dark:border-[#334238] dark:text-[#cbd5e1]">
              <span>{blind ? t.blind : t.visible}</span>
              <button
                type="button"
                onClick={() => setBlind(!blind)}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2 transition-colors cursor-pointer font-bold",
                  blind
                    ? "bg-[#c8ee63] text-stone-950"
                    : "bg-[#e2edd3] text-[#23380e] dark:bg-[#29382b] dark:text-[#bcee68]",
                )}
              >
                {blind ? (
                  <EyeOff className="mr-1.5 size-4" />
                ) : (
                  <Headphones className="mr-1.5 size-4" />
                )}
                {t.blind}
              </button>
            </div>
          </div>
        </section>

        {/* Pasek sterowania głosem */}
        <div className="mx-auto mb-12 max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <VoiceController
            lang={lang}
            voiceMode={voiceMode}
            isSpeaking={isSpeaking}
            onMoveParsed={applyMove}
            labels={{
              listeningText: t.listeningText,
              startVoiceText: t.startVoiceText,
              inputPlaceholder: t.inputPlaceholder,
              submitMoveText: t.submitMoveText,
              unsupportedSpeech: t.unsupportedSpeech,
              speechError: t.speechError,
              unrecognizedMove: t.unrecognizedMove,
            }}
          />
        </div>

        <TacticsSection
          lang={lang}
          activePuzzle={activePuzzle}
          onSelectPuzzle={loadPuzzle}
          title={t.tacticsTitle}
          subtitle={t.tacticsBody}
          exploreText={t.explore}
          activeBadgeText={t.activePuzzleBadge}
        />

        <section
          id="how-it-works"
          className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12"
        >
          <h2 className="font-serif text-3xl font-semibold">{t.howTitle}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {t.howSteps.map((step, i) => (
              <article
                key={step}
                className="rounded-2xl border border-[#dfe5dc] bg-white p-6 shadow-sm dark:border-[#29332e] dark:bg-[#18201b]"
              >
                <span className="inline-block rounded-lg bg-[#eaf4d5] px-2.5 py-1 font-mono text-xs font-bold text-[#2d4e13] dark:bg-[#29382b] dark:text-[#bcee68]">
                  0{i + 1}
                </span>
                <h3 className="mt-6 font-serif text-lg font-semibold">
                  {step}
                </h3>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dfe5dc] px-5 py-10 dark:border-[#29332e]">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 text-sm text-[#3c4a41] dark:text-[#cbd5e1] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="font-serif text-[#17201c] dark:text-white">
              ChessTactics
            </strong>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#424e46] dark:text-[#cbd5e1]">
              {t.description}
            </p>
            <p className="mt-2 text-xs text-[#424e46] dark:text-[#94a3b8]">
              © 2026 ChessTactics. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span>
              {lang.toUpperCase()} · {dark ? "Dark" : "Light"}
            </span>
            <button
              type="button"
              onClick={() => setLegal("privacy")}
              className="underline text-[#3c4a41] dark:text-[#cbd5e1] hover:text-[#17201c] dark:hover:text-white cursor-pointer"
            >
              {t.privacy}
            </button>
            <button
              type="button"
              onClick={() => setLegal("terms")}
              className="underline text-[#3c4a41] dark:text-[#cbd5e1] hover:text-[#17201c] dark:hover:text-white cursor-pointer"
            >
              {t.terms}
            </button>
          </div>
        </div>
      </footer>

      {cookies && (
        <div className="fixed inset-x-4 bottom-4 z-40 flex flex-col gap-4 rounded-2xl border border-[#d5e1d0] bg-white p-5 shadow-2xl dark:border-[#334238] dark:bg-[#1d2820] sm:inset-x-auto sm:right-6 sm:max-w-xl sm:flex-row sm:items-center">
          <p className="flex-1 text-xs text-[#2a362f] dark:text-[#e2e8f0] sm:text-sm">
            {t.cookie}{" "}
            <button
              type="button"
              onClick={() => setLegal("privacy")}
              className="font-semibold underline cursor-pointer"
            >
              {t.privacy}
            </button>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setCookies(false)}
              className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white shadow hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-stone-950 dark:hover:bg-[#b8de53] transition-colors cursor-pointer"
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}

      {mounted && showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t.backTop}
          className="fixed bottom-6 left-6 z-30 flex size-11 items-center justify-center rounded-full bg-[#17201c] text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-[#c8ee63] dark:text-[#17201c] cursor-pointer"
        >
          ↑
        </button>
      )}

      <SettingsModal
        isOpen={settings}
        onClose={() => setSettings(false)}
        lang={lang}
        setLang={setLang}
        blind={blind}
        setBlind={setBlind}
        coachMuted={coachMuted}
        setCoachMuted={setCoachMuted}
        speed={speed}
        setSpeed={setSpeed}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        voiceMode={voiceMode}
        setVoiceMode={setVoiceMode}
        labels={{
          title: t.settings,
          language: t.language,
          blind: t.blind,
          voiceSpeed: t.voiceSpeed,
          difficulty: t.difficulty,
          beginner: t.beginner,
          intermediate: t.intermediate,
          master: t.master,
          voiceInput: t.voiceInput,
          continuous: t.continuous,
          push: t.push,
          coachVoiceActive: t.coachVoiceActive,
          done: t.done,
          close: t.close,
        }}
      />

      <LegalModal
        type={legal}
        onClose={() => setLegal(null)}
        labels={{
          privacyTitle: t.privacy,
          termsTitle: t.terms,
          close: t.close,
        }}
      />
    </div>
  );
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
