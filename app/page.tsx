// app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, EyeOff, Headphones, Play } from "lucide-react";
import { Chess, Move, Square } from "chess.js";
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
import { playChessSound } from "@/lib/audio-effects";
import { stockfishService } from "@/lib/stockfish-service";
import { Lang, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

// Leniwe ładowanie modali (nie blokują LCP ani FCP)
const SettingsModal = dynamic(
  () => import("@/components/settings-modal").then((mod) => mod.SettingsModal),
  { ssr: false },
);

const LegalModal = dynamic(
  () => import("@/components/legal-modal").then((mod) => mod.LegalModal),
  { ssr: false },
);

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

  const [coachInsight, setCoachInsight] = useState<string>(
    () => translations.pl.defaultCoachText,
  );

  const [coachMuted, setCoachMutedState] = useState(false);
  // Natychmiastowa referencja wyciszenia – odporna na opóźnienia i asynchroniczność
  const coachMutedRef = useRef(false);

  const setCoachMuted = useCallback((muted: boolean) => {
    coachMutedRef.current = muted;
    setCoachMutedState(muted);
    if (muted && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  }, []);

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

  // Tryb ciemny
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const announce = useCallback(
    (message: string, onComplete?: () => void) => {
      // Zawsze sprawdzamy aktualną referencję coachMutedRef
      if (coachMutedRef.current) {
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

          let hasCompleted = false;
          let safetyTimer: number | null = null;

          const handleFinish = () => {
            if (hasCompleted) return;
            hasCompleted = true;

            if (safetyTimer) {
              window.clearTimeout(safetyTimer);
              safetyTimer = null;
            }

            speakCooldownTimeoutRef.current = window.setTimeout(() => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              if (onComplete) onComplete();
            }, 100);
          };

          utterance.onstart = () => {
            if (coachMutedRef.current) {
              window.speechSynthesis.cancel();
              handleFinish();
              return;
            }
            isSpeakingRef.current = true;
            setIsSpeaking(true);
          };

          utterance.onend = handleFinish;
          utterance.onerror = handleFinish;

          // Watchdog dla Windows Chromium w razie braku zdarzenia onend
          const rateMultiplier = Number(speed) || 1;
          const estimatedDuration =
            Math.max(2500, ((message.length / 8) * 1000) / rateMultiplier) +
            1200;

          safetyTimer = window.setTimeout(() => {
            if (!hasCompleted) {
              handleFinish();
            }
          }, estimatedDuration);

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
    [lang, speed],
  );

  const handleResign = () => {
    if (isResigned || gameInstance.isGameOver()) return;

    if (botTimeoutRef.current) {
      window.clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    setIsResigned(true);
    setSelected(null);
    playChessSound("victory");

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

  // Głęboka analiza Google Gemini AI z ugruntowanym promptem i lokalnym fallbackiem
  const handleDeepAiAnalysis = async () => {
    if (isAnalyzingAi) return;
    setIsAnalyzingAi(true);

    try {
      const fen = gameInstance.fen();

      // 1. ZAWSZE NAJPIERW PRAWDZIWE GOOGLE GEMINI AI (/api/analyze)
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(2500),
          body: JSON.stringify({
            fen,
            history: gameInstance.history(),
            lang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.insight) {
            setCoachInsight(data.insight);
            lastValidCoachInsightRef.current = data.insight;
            announce(data.audioText || data.insight);
            return;
          }
        }
      } catch (apiErr) {
        console.warn(
          "[ANALIZA AI] Gemini API fallback do silnika lokalnego:",
          apiErr,
        );
      }

      // 2. Natychmiastowy lokalny fallback pedagogiczny (przy braku sieci / timeoutcie API)
      const localEval = stockfishService.evaluateLocally(fen);
      const coachMsg = stockfishService.generateEvaluationCoachText(
        localEval,
        gameInstance.turn() === "w",
        lang,
      );
      setCoachInsight(coachMsg.insight);
      lastValidCoachInsightRef.current = coachMsg.insight;
      announce(coachMsg.audioText);
    } catch {
      setCoachInsight(t.undoTextMsg);
      lastValidCoachInsightRef.current = t.undoTextMsg;
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Błyskawiczna odpowiedź bota (<50 ms) oparta na zoptymalizowanym Minimax z Alpha-Beta
  const executeComputerResponse = () => {
    if (gameInstance.isGameOver() || isResigned) return;

    try {
      let chosenMove: { from: Square; to: Square; promotion?: string } | null =
        null;

      // Szybki lokalny Minimax (<50 ms, MVV-LVA, Mating Drive, Księga Debiutów)
      const localMove = findBestEngineMove(gameInstance, difficulty);
      if (localMove) {
        const isPromo =
          localMove.piece === "p" &&
          ((localMove.from[1] === "7" && localMove.to[1] === "8") ||
            (localMove.from[1] === "2" && localMove.to[1] === "1"));

        chosenMove = {
          from: localMove.from as Square,
          to: localMove.to as Square,
          ...(isPromo ? { promotion: localMove.promotion || "q" } : {}),
        };
      }

      if (!chosenMove) {
        const legal = gameInstance.moves({ verbose: true });
        if (legal.length > 0) {
          chosenMove = {
            from: legal[0].from as Square,
            to: legal[0].to as Square,
          };
        }
      }

      if (!chosenMove) return;

      const reply: Move | null = gameInstance.move(chosenMove);
      if (!reply) return;

      setBoard([...gameInstance.board()]);
      setTurn(gameInstance.turn());
      setMoves([...gameInstance.history()]);
      setMaterial(calculateMaterialBalance(gameInstance, lang));

      if (gameInstance.isCheckmate()) {
        playChessSound("victory");
      } else if (gameInstance.isStalemate() || gameInstance.isDraw()) {
        playChessSound("move");
      } else if (gameInstance.inCheck()) {
        playChessSound("check");
      } else if (reply.captured) {
        playChessSound("capture");
      } else {
        playChessSound("move");
      }

      const replyAnalysis = generateCoachInsight(
        gameInstance,
        reply,
        lang,
        false,
      );

      // Trener wyświetla komentarz do ruchu bota
      setCoachInsight(replyAnalysis.insight);
      lastValidCoachInsightRef.current = replyAnalysis.insight;

      // Mówi tylko wtedy, gdy dźwięk nie jest wyciszony
      if (!coachMutedRef.current) {
        announce(replyAnalysis.audioText);
      }
    } catch (err) {
      console.error("Błąd podczas ruchu komputera:", err);
    }
  };

  const applyMove = (notation: string | { from: string; to: string }) => {
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

      let result: Move | null = null;
      if (typeof finalMove === "string") {
        result = gameInstance.move(finalMove, { strict: false });
      } else {
        const piece = gameInstance.get(finalMove.from as Square);
        const isPromotion =
          piece?.type === "p" &&
          ((finalMove.from[1] === "7" && finalMove.to[1] === "8") ||
            (finalMove.from[1] === "2" && finalMove.to[1] === "1"));

        result = gameInstance.move({
          from: finalMove.from as Square,
          to: finalMove.to as Square,
          ...(isPromotion ? { promotion: "q" } : {}),
        });
      }

      if (!result) {
        throw new Error("Invalid move");
      }

      const isGameOverAfterMove = gameInstance.isGameOver();

      if (gameInstance.isCheckmate()) {
        playChessSound("victory");
      } else if (gameInstance.isStalemate() || gameInstance.isDraw()) {
        playChessSound("move");
      } else if (gameInstance.inCheck()) {
        playChessSound("check");
      } else if (result.captured) {
        playChessSound("capture");
      } else {
        playChessSound("move");
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
          playChessSound("victory");
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

      // Trener wyświetla wskazówkę po ruchu gracza
      setCoachInsight(playerAnalysis.insight);
      lastValidCoachInsightRef.current = playerAnalysis.insight;

      if (isGameOverAfterMove) {
        announce(playerAnalysis.audioText);
        return;
      }

      // Odpowiedź bota – Natural Pacing: czeka na koniec mowy trenera
      if (!coachMutedRef.current) {
        announce(playerAnalysis.audioText, () => {
          botTimeoutRef.current = window.setTimeout(() => {
            executeComputerResponse();
          }, 150);
        });
      } else {
        botTimeoutRef.current = window.setTimeout(() => {
          executeComputerResponse();
        }, 150);
      }
    } catch {
      playChessSound("illegal");
      setCoachInsight(t.illegalMoveMsg);
      announce(t.illegalMoveMsg);

      setTimeout(() => {
        setCoachInsight((current: string) =>
          current === t.illegalMoveMsg
            ? lastValidCoachInsightRef.current
            : current,
        );
      }, 2500);
    }
  };

  // Płynna selekcja bierek (Fluid Reselection) – natychmiastowe przełączenie na inną własną bierkę
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
    playChessSound("move");

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
      playChessSound("move");

      const undoText = t.undoTextMsg;
      setCoachInsight(undoText);
      lastValidCoachInsightRef.current = undoText;
      announce(undoText);
    } catch {}
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
      playChessSound("move");

      const hint = puzzle.hint[lang];
      setCoachInsight(hint);
      lastValidCoachInsightRef.current = hint;
      announce(hint);
      scrollToSection("live-coach");
    } catch {}
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
        onToggleLang={() => {
          const nextLang: Lang = lang === "en" ? "pl" : "en";
          setLang(nextLang);
          if (moves.length === 0) {
            const nextDefault = translations[nextLang].defaultCoachText;
            setCoachInsight(nextDefault);
            lastValidCoachInsightRef.current = nextDefault;
          }
        }}
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
        {/* Sekcja Hero */}
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
                onToggleMute={() => setCoachMuted(!coachMuted)}
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

      {/* Dostępna stopka witryny */}
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

      {/* Ciasteczka i Consent Mode v2 */}
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
