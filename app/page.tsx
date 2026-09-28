// app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, EyeOff, Headphones, Play } from "lucide-react";
import { Chess, Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { ChessBoardView } from "@/components/chess-board-view";
import { CoachPanel } from "@/components/coach-panel";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VoiceController } from "@/components/voice-controller";
import { TacticsSection } from "@/components/tactics-section";
import { CookieConsent } from "@/components/cookie-consent";
import {
  calculateMaterialBalance,
  evaluateTacticalPuzzle,
  findBestEngineMove,
  generateBlindfoldStatus,
  generateCoachInsight,
  MaterialScore,
  TACTICAL_PUZZLES,
} from "@/lib/chess-coach-engine";
import { stockfishService } from "@/lib/stockfish-service";
import { Lang, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

// Leniwe ładowanie wyłącznie modali (nie blokują startu ani krytycznego renderowania LCP)
const SettingsModal = dynamic(
  () => import("@/components/settings-modal").then((mod) => mod.SettingsModal),
  { ssr: false },
);

const LegalModal = dynamic(
  () => import("@/components/legal-modal").then((mod) => mod.LegalModal),
  { ssr: false },
);

// Bezpieczne, dynamiczne odtwarzanie efektów dźwiękowych
const playSound = async (
  type: "move" | "capture" | "check" | "victory" | "illegal",
) => {
  try {
    const audio = await import("@/lib/audio-effects");
    if (type === "move") audio.playMoveSound();
    else if (type === "capture") audio.playCaptureSound();
    else if (type === "check") audio.playCheckSound();
    else if (type === "victory") audio.playVictorySound();
    else if (type === "illegal") audio.playIllegalSound();
  } catch {
    // Ignoruj błąd odtwarzania audio w przeglądarkach blokujących autoplay
  }
};

type LegalType = "privacy" | "terms" | null;

export default function Page() {
  const [lang, setLang] = useState<Lang>("pl");
  const [dark, setDark] = useState(false);
  const [blind, setBlind] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [settings, setSettings] = useState(false);
  const [legal, setLegal] = useState<LegalType>(null);
  const [cookies, setCookies] = useState(true);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [speed, setSpeed] = useState("1");
  const [voiceMode, setVoiceMode] = useState<"continuous" | "push">("push");

  // Bezpośrednia inicjalizacja domyślnym tekstem zapobiega niepotrzebnemu re-renderowi po montowaniu
  const [coachInsight, setCoachInsight] = useState(
    () => translations.pl.defaultCoachText,
  );
  const [coachMuted, setCoachMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [activePuzzle, setActivePuzzle] = useState<number | null>(null);
  const [isResigned, setIsResigned] = useState(false);

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

  const lastValidCoachInsightRef = useRef<string>(
    translations.pl.defaultCoachText,
  );
  const botTimeoutRef = useRef<number | null>(null);
  const speakCooldownTimeoutRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  const t = translations[lang];

  useEffect(() => {
    const defaultText = translations[lang].defaultCoachText;
    if (coachInsight !== defaultText) {
      setCoachInsight(defaultText);
    }
    lastValidCoachInsightRef.current = defaultText;
  }, [lang, coachInsight]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const announce = useCallback(
    (message: string, onComplete?: () => void) => {
      if (coachMuted) {
        if (onComplete) onComplete();
        return;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          if (speakCooldownTimeoutRef.current) {
            window.clearTimeout(speakCooldownTimeoutRef.current);
            speakCooldownTimeoutRef.current = null;
          }

          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = lang === "pl" ? "pl-PL" : "en-US";
          utterance.rate = Number(speed);

          utterance.onstart = () => {
            isSpeakingRef.current = true;
            setIsSpeaking(true);
          };

          const handleFinish = () => {
            // Bezpieczny bufor 600ms po zakończeniu mowy na wygaszenie echa w mikrofonie
            speakCooldownTimeoutRef.current = window.setTimeout(() => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              if (onComplete) onComplete();
            }, 600);
          };

          utterance.onend = handleFinish;
          utterance.onerror = handleFinish;

          window.speechSynthesis.speak(utterance);
        } catch {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          if (onComplete) onComplete();
        }
      } else {
        if (onComplete) onComplete();
      }
    },
    [coachMuted, lang, speed],
  );

  const handleResign = () => {
    if (isResigned || gameInstance.isGameOver()) return;

    if (botTimeoutRef.current) {
      window.clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    setIsResigned(true);
    setSelected(null);
    playSound("victory");

    const resignText = t.resignedMsg;
    setCoachInsight(resignText);
    lastValidCoachInsightRef.current = resignText;
    announce(resignText);
  };

  const speakBlindfoldStatus = () => {
    const statusText = generateBlindfoldStatus(gameInstance, lang);
    setCoachInsight(statusText);
    lastValidCoachInsightRef.current = statusText;
    announce(statusText);
  };

  // Głęboka analiza: w pierwszej kolejności korzysta z lokalnego Stockfisha (0 opóźnienia sieciowego)
  const handleDeepAiAnalysis = async () => {
    if (isAnalyzingAi) return;
    setIsAnalyzingAi(true);

    try {
      // 1. Arcymistrzowska analiza Stockfisha prosto z Web Workera
      const stockfishEval = await stockfishService.evaluatePosition(
        gameInstance.fen(),
        12,
      );

      if (stockfishEval) {
        const coachMsg = stockfishService.generateEvaluationCoachText(
          stockfishEval,
          gameInstance.turn() === "w",
          lang,
        );
        setCoachInsight(coachMsg.insight);
        lastValidCoachInsightRef.current = coachMsg.insight;
        announce(coachMsg.audioText);
        setIsAnalyzingAi(false);
        return;
      }

      // 2. Fallback do endpointu API, jeśli dostępny
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
      // Ignoruj błąd
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const executeComputerResponse = async () => {
    if (gameInstance.isGameOver() || isResigned) return;

    try {
      let chosenMove:
        | string
        | { from: string; to: string; promotion?: string }
        | null = null;

      // Na poziomie "master" pytamy Stockfisha w tle o optymalne posunięcie
      if (difficulty === "master") {
        try {
          const sfEval = await stockfishService.evaluatePosition(
            gameInstance.fen(),
            10,
          );
          if (sfEval && sfEval.from && sfEval.to) {
            chosenMove = {
              from: sfEval.from,
              to: sfEval.to,
              promotion: sfEval.promotion || "q",
            };
          }
        } catch {
          // W razie niedostępności workera przejdź do szybkiego silnika lokalnego
        }
      }

      if (!chosenMove) {
        chosenMove = findBestEngineMove(gameInstance, difficulty);
      }

      if (!chosenMove) return;

      const reply = gameInstance.move(chosenMove as any);
      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([...gameInstance.history()]);
      setMaterial(calculateMaterialBalance(gameInstance, lang));

      if (gameInstance.isCheckmate()) {
        playSound("victory");
      } else if (gameInstance.isStalemate() || gameInstance.isDraw()) {
        playSound("move");
      } else if (gameInstance.inCheck()) {
        playSound("check");
      } else if (reply.captured) {
        playSound("capture");
      } else {
        playSound("move");
      }

      const replyAnalysis = generateCoachInsight(
        gameInstance,
        reply,
        lang,
        false,
      );

      setCoachInsight(replyAnalysis.insight);
      lastValidCoachInsightRef.current = replyAnalysis.insight;
      announce(replyAnalysis.audioText);
    } catch {
      // Ignoruj
    }
  };

  const applyMove = (notation: string | { from: string; to: string }) => {
    // Ignoruj wejścia, jeśli trener aktualnie mówi
    if (isSpeakingRef.current) return;

    if (typeof notation === "string" && notation === "RESIGN") {
      handleResign();
      return;
    }

    if (isResigned) return;

    try {
      if (botTimeoutRef.current) {
        window.clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }

      let finalMove: any = notation;

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

      const isGameOverAfterMove = gameInstance.isGameOver();

      if (gameInstance.isCheckmate()) {
        playSound("victory");
      } else if (gameInstance.isStalemate() || gameInstance.isDraw()) {
        playSound("move");
      } else if (gameInstance.inCheck()) {
        playSound("check");
      } else if (result.captured) {
        playSound("capture");
      } else {
        playSound("move");
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
          playSound("victory");
          setActivePuzzle(null);
        }

        announce(puzzleCheck.audioText);
        return;
      }

      const playerAnalysis = generateCoachInsight(
        gameInstance,
        result,
        lang,
        true,
      );
      setCoachInsight(playerAnalysis.insight);
      lastValidCoachInsightRef.current = playerAnalysis.insight;

      // Jeśli ruch gracza zakończył partię (mat, pat, remis), NIE planujemy ruchu bota!
      if (isGameOverAfterMove) {
        announce(playerAnalysis.audioText);
        return;
      }

      if (!coachMuted) {
        announce(playerAnalysis.audioText, () => {
          botTimeoutRef.current = window.setTimeout(() => {
            executeComputerResponse();
          }, 500);
        });
      } else {
        botTimeoutRef.current = window.setTimeout(() => {
          executeComputerResponse();
        }, 800);
      }
    } catch {
      playSound("illegal");
      const err = t.illegalMoveMsg;
      setCoachInsight(err);
      announce(err);

      window.setTimeout(() => {
        if (lastValidCoachInsightRef.current) {
          setCoachInsight(lastValidCoachInsightRef.current);
        }
      }, 3000);
    }
  };

  const handleSquareClick = (i: number) => {
    if (isResigned || gameInstance.isGameOver()) return;

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

      if (fromSquare === clickedSquare) {
        setSelected(null);
        return;
      }

      if (clickedPiece && clickedPiece.color === gameInstance.turn()) {
        setSelected(i);
        return;
      }

      applyMove({ from: fromSquare, to: clickedSquare });
    }
  };

  const newGame = () => {
    if (botTimeoutRef.current) {
      window.clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    gameInstance.reset();
    setIsResigned(false);
    setBoard([...gameInstance.board()]);
    setTurn(gameInstance.turn());
    setMoves([]);
    setSelected(null);
    setActivePuzzle(null);
    setMaterial(calculateMaterialBalance(gameInstance, lang));
    playSound("move");

    const displayText = t.newGameIntroText;
    setCoachInsight(displayText);
    lastValidCoachInsightRef.current = displayText;
    announce(displayText);
    scrollToSection("live-coach");
  };

  const undoMove = () => {
    if (isResigned) return;

    try {
      if (botTimeoutRef.current) {
        window.clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }

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
      playSound("move");

      const undoText = t.undoTextMsg;
      setCoachInsight(undoText);
      lastValidCoachInsightRef.current = undoText;
      announce(undoText);
    } catch {
      // Ignoruj
    }
  };

  const loadPuzzle = (index: number) => {
    if (botTimeoutRef.current) {
      window.clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    const puzzle = TACTICAL_PUZZLES[index];
    if (!puzzle) return;

    try {
      gameInstance.load(puzzle.fen);
      setIsResigned(false);
      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([]);
      setSelected(null);
      setActivePuzzle(index);
      setMaterial(calculateMaterialBalance(gameInstance, lang));
      playSound("move");

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

  const isGameOverState = isResigned || gameInstance.isGameOver();

  // Precyzyjny status nagłówka szachownicy: odróżnia szach-mat od pata i remisu
  const getGameStatusLabel = () => {
    if (isResigned) {
      return lang === "pl" ? "Poddana" : "Resigned";
    }
    if (gameInstance.isCheckmate()) {
      return lang === "pl" ? "Szach i mat!" : "Checkmate!";
    }
    if (gameInstance.isStalemate()) {
      return lang === "pl" ? "Pat · Remis" : "Stalemate · Draw";
    }
    if (gameInstance.isDraw()) {
      return lang === "pl" ? "Remis" : "Draw";
    }
    return turn === "w" ? t.turnWhite : t.turnBlack;
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
        {/* Sekcja Hero - renderowana w całości w czystym SSR */}
        <section className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-24 lg:pt-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/30 bg-[#eaf4d5] px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-[#2d4e13] dark:bg-[#1f2d22] dark:text-[#bcee68]">
              <span className="size-2 rounded-full bg-[#365314] opacity-80" />
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
                <span className="size-2 rounded-full bg-[#2d4e13] dark:bg-[#bcee68] transition-opacity" />
                {t.live}{" "}
                {activePuzzle !== null &&
                  TACTICAL_PUZZLES[activePuzzle] &&
                  `· ${TACTICAL_PUZZLES[activePuzzle].title[lang]}`}
              </span>
              <span className="text-[#3c4a41] dark:text-[#cbd5e1] font-semibold">
                {getGameStatusLabel()}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
              <ChessBoardView
                board={board}
                selectedSquare={selected}
                onSquareClick={handleSquareClick}
                blindfold={blind}
                lang={lang}
                labels={{
                  blind: t.blind,
                  peek: t.peek,
                  hint: t.hint,
                  blindfoldDesc: t.blindfoldDesc,
                }}
              />

              <CoachPanel
                coachInsight={coachInsight}
                isSpeaking={isSpeaking}
                coachMuted={coachMuted}
                onToggleMute={() => {
                  if (speakCooldownTimeoutRef.current) {
                    window.clearTimeout(speakCooldownTimeoutRef.current);
                    speakCooldownTimeoutRef.current = null;
                  }
                  if (!coachMuted && typeof window !== "undefined") {
                    window.speechSynthesis?.cancel();
                    isSpeakingRef.current = false;
                    setIsSpeaking(false);
                  }
                  setCoachMuted(!coachMuted);
                }}
                onReplayAudio={() => announce(coachInsight)}
                onDeepAiAnalysis={handleDeepAiAnalysis}
                isAnalyzingAi={isAnalyzingAi}
                blindfold={blind}
                onSpeakBlindfoldStatus={speakBlindfoldStatus}
                moves={moves}
                material={material}
                onUndoMove={undoMove}
                onNewGame={newGame}
                onResign={handleResign}
                isGameOver={isGameOverState}
                labels={{
                  coach: t.coach,
                  muteCoach: t.muteCoach,
                  unmuteCoach: t.unmuteCoach,
                  replay: t.replay,
                  aiAnalysisBtn: t.aiAnalysisBtn,
                  aiAnalyzing: t.aiAnalyzing,
                  statusAudio: t.statusAudio,
                  moves: t.moves,
                  materialWhite: t.materialWhite,
                  materialBlack: t.materialBlack,
                  materialEqual: t.materialEqual,
                  listen: t.listen,
                  undoBtn: t.undoBtn,
                  newGameBtn: t.newGameBtn,
                  resignBtn: t.resignBtn,
                }}
              />
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
              speakingMuted: t.speakingMuted,
              inputPlaceholder: t.inputPlaceholder,
              submitMoveText: t.submitMoveText,
              unsupportedSpeech: t.unsupportedSpeech,
              speechError: t.speechError,
              unrecognizedMove: t.unrecognizedMove,
            }}
          />
        </div>

        {/* Sekcja łamigłówek taktycznych */}
        <TacticsSection
          lang={lang}
          activePuzzle={activePuzzle}
          onSelectPuzzle={loadPuzzle}
          title={t.tacticsTitle}
          subtitle={t.tacticsBody}
          exploreText={t.explore}
          activeBadgeText={t.activePuzzleBadge}
        />

        {/* Sekcja Jak to działa */}
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

      {/* Stopka */}
      <SiteFooter
        lang={lang}
        dark={dark}
        description={t.description}
        privacyLabel={t.privacy}
        termsLabel={t.terms}
        onOpenPrivacy={() => setLegal("privacy")}
        onOpenTerms={() => setLegal("terms")}
        onOpenCookies={() => setCookies(true)}
      />

      {/* Ciasteczka RODO */}
      <CookieConsent
        isOpen={cookies}
        onOpen={() => setCookies(true)}
        onClose={() => setCookies(false)}
        onOpenPrivacy={() => setLegal("privacy")}
        cookieText={t.cookie}
        privacyText={t.privacy}
        rejectText={t.reject}
        acceptText={t.accept}
        backTopText={t.backTop}
        cookieSettingsText={
          lang === "pl" ? "Ustawienia plików cookie" : "Cookie settings"
        }
      />

      {/* Modal ustawień */}
      {settings && (
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
      )}

      {/* Modal prawny */}
      {legal !== null && (
        <LegalModal
          type={legal}
          onClose={() => setLegal(null)}
          labels={{
            privacyTitle: t.privacy,
            termsTitle: t.terms,
            close: t.close,
          }}
        />
      )}
    </div>
  );
}
