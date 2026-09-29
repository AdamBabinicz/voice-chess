// components/coach-panel.tsx
"use client";

import {
  AudioLines,
  Flag,
  Headphones,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MaterialScore } from "@/lib/chess-coach-engine";
import { cn } from "@/lib/utils";

interface CoachPanelProps {
  coachInsight: string;
  isSpeaking: boolean;
  coachMuted: boolean;
  onToggleMute: () => void;
  onReplayAudio: () => void;
  onDeepAiAnalysis: () => void;
  isAnalyzingAi: boolean;
  blindfold: boolean;
  onSpeakBlindfoldStatus: () => void;
  moves: string[];
  material: MaterialScore;
  onUndoMove: () => void;
  onNewGame: () => void;
  onResign: () => void;
  isGameOver: boolean;
  labels: {
    coach: string;
    muteCoach: string;
    unmuteCoach: string;
    replay: string;
    aiAnalysisBtn: string;
    aiAnalyzing: string;
    statusAudio: string;
    moves: string;
    materialWhite: string;
    materialBlack: string;
    materialEqual: string;
    listen: string;
    undoBtn: string;
    newGameBtn: string;
    resignBtn: string;
  };
}

export function CoachPanel({
  coachInsight,
  isSpeaking,
  coachMuted,
  onToggleMute,
  onReplayAudio,
  onDeepAiAnalysis,
  isAnalyzingAi,
  blindfold,
  onSpeakBlindfoldStatus,
  moves,
  material,
  onUndoMove,
  onNewGame,
  onResign,
  isGameOver,
  labels,
}: CoachPanelProps) {
  const displayInsight = (coachInsight || "").trim();

  return (
    <div className="flex flex-col gap-4">
      {/* Ramka wskazówki trenera */}
      <div className="rounded-2xl border border-[#d8e2d4] bg-[#f1f5ed] p-4 dark:border-[#2f3d33] dark:bg-[#202b25]">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#2d4e13] dark:text-[#bcee68]">
          <span className="flex items-center gap-1.5">
            <AudioLines className="size-4" />
            {labels.coach}
          </span>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <span className="flex gap-0.5">
                <span className="size-1 rounded-full bg-[#2d4e13] dark:bg-[#bcee68] animate-ping" />
              </span>
            )}
            <button
              type="button"
              onClick={onToggleMute}
              title={coachMuted ? labels.unmuteCoach : labels.muteCoach}
              aria-label={coachMuted ? labels.unmuteCoach : labels.muteCoach}
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

        <p
          suppressHydrationWarning
          className="font-serif text-sm italic leading-relaxed text-[#2a362f] dark:text-[#e2e8f0]"
        >
          {displayInsight ? `\u201C${displayInsight}\u201D` : labels.listen}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReplayAudio}
            disabled={coachMuted}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2d4e13] disabled:opacity-40 dark:text-[#bcee68] hover:underline cursor-pointer"
          >
            {isSpeaking ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
            <span>{labels.replay}</span>
          </button>

          <button
            type="button"
            onClick={onDeepAiAnalysis}
            disabled={isAnalyzingAi}
            className="flex items-center gap-1.5 rounded-lg border border-[#365314]/30 bg-[#c8ee63]/30 px-2.5 py-1 text-[11px] font-bold text-[#1f3708] hover:bg-[#c8ee63]/50 disabled:opacity-50 dark:border-[#a8d655]/40 dark:bg-[#a8d655]/20 dark:text-[#bced6b] dark:hover:bg-[#a8d655]/40 transition-colors cursor-pointer"
          >
            {isAnalyzingAi ? (
              <Loader2 className="size-3 animate-spin text-[#2d4e13]" />
            ) : (
              <Sparkles className="size-3 text-[#2d4e13] dark:text-[#bcee68]" />
            )}
            <span>
              {isAnalyzingAi ? labels.aiAnalyzing : labels.aiAnalysisBtn}
            </span>
          </button>

          {blindfold && (
            <button
              type="button"
              onClick={onSpeakBlindfoldStatus}
              className="flex items-center gap-1 text-[11px] font-semibold text-stone-800 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white cursor-pointer"
            >
              <Headphones className="size-3.5 text-[#2d4e13] dark:text-[#bcee68]" />
              <span>{labels.statusAudio}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista posunięć i bilans materiału */}
      <div>
        <div className="mb-2 flex justify-between text-xs font-bold text-[#3c4a41] dark:text-[#cbd5e1]">
          <span>
            {labels.moves} ({moves.length} ply)
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
              ? `${labels.materialWhite} ${material.display}`
              : material.score < 0
                ? `${labels.materialBlack} ${material.display}`
                : labels.materialEqual}
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
              {labels.listen}
            </span>
          )}
        </div>
      </div>

      {/* Przyciski sterowania grą */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndoMove}
            disabled={moves.length === 0 || isGameOver}
            className="flex-1 whitespace-nowrap rounded-xl border border-stone-400 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {labels.undoBtn}
          </button>

          <button
            type="button"
            onClick={onResign}
            disabled={moves.length === 0 || isGameOver}
            title={labels.resignBtn}
            aria-label={labels.resignBtn}
            className="flex-1 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl border border-rose-300/80 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-30 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Flag className="size-3.5 shrink-0" />
            <span>{labels.resignBtn}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNewGame}
          className="w-full whitespace-nowrap rounded-xl bg-stone-950 py-2 text-xs font-bold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 transition-colors cursor-pointer text-center"
        >
          {labels.newGameBtn}
        </button>
      </div>
    </div>
  );
}
