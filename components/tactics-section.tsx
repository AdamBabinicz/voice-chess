// components/tactics-section.tsx
"use client";

import { useState } from "react";
import { ChevronRight, Filter } from "lucide-react";
import { TACTICAL_PUZZLES, TacticalPuzzle } from "@/lib/tactical-puzzles";
import { Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface TacticsSectionProps {
  lang: Lang;
  activePuzzle: number | null;
  onSelectPuzzle: (index: number) => void;
  title: string;
  subtitle: string;
  exploreText: string;
  activeBadgeText: string;
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "master";

export function TacticsSection({
  lang,
  activePuzzle,
  onSelectPuzzle,
  title,
  subtitle,
  exploreText,
  activeBadgeText,
}: TacticsSectionProps) {
  const [filter, setFilter] = useState<DifficultyFilter>("all");

  const filterLabels: Record<DifficultyFilter, { pl: string; en: string }> = {
    all: { pl: "Wszystkie", en: "All" },
    beginner: { pl: "Początkujący", en: "Beginner" },
    intermediate: { pl: "Średniozaawansowany", en: "Intermediate" },
    master: { pl: "Mistrz", en: "Master" },
  };

  const filteredPuzzles = TACTICAL_PUZZLES.filter((puzzle) => {
    if (filter === "all") return true;
    return puzzle.difficulty === filter;
  });

  return (
    <section
      id="tactics"
      className="border-y border-[#dfe5dc] bg-[#eef3ea] dark:border-[#29332e] dark:bg-[#172019]"
    >
      <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-[#17201c] dark:text-[#edf2ed]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#3c4a41] dark:text-[#cbd5e1] sm:text-base">
              {subtitle}
            </p>
          </div>

          {/* Filtry poziomu trudności – 100% zgodne z WCAG WAI-ARIA role="group" + aria-pressed */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={
              lang === "pl"
                ? "Filtry zadań taktycznych według poziomu trudności"
                : "Tactical puzzle difficulty filters"
            }
          >
            <div className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-[#3c4a41] dark:text-[#94a3b8]">
              <Filter className="size-3.5" />
              <span>{lang === "pl" ? "Poziom:" : "Level:"}</span>
            </div>
            {(
              [
                "all",
                "beginner",
                "intermediate",
                "master",
              ] as DifficultyFilter[]
            ).map((level) => {
              const isSelected = filter === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFilter(level)}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4e13]",
                    isSelected
                      ? "bg-[#2d4e13] text-white shadow-sm dark:bg-[#a8d655] dark:text-[#17201c]"
                      : "bg-white text-[#3c4a41] hover:bg-[#e2ebd8] dark:bg-[#202f23] dark:text-[#cbd5e1] dark:hover:bg-[#293c2d]",
                  )}
                >
                  {filterLabels[level][lang]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPuzzles.map((puzzle: TacticalPuzzle) => {
            // Bezpieczne mapowanie do oryginalnego indeksu w TACTICAL_PUZZLES
            const originalIndex = TACTICAL_PUZZLES.findIndex(
              (p) => p.id === puzzle.id,
            );
            const isActive = activePuzzle === originalIndex;

            return (
              <div
                key={puzzle.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onSelectPuzzle(originalIndex)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectPuzzle(originalIndex);
                  }
                }}
                aria-label={`${puzzle.title[lang]} - ${puzzle.difficultyLabel[lang]}${isActive ? (lang === "pl" ? " (aktualnie wybrane)" : " (currently selected)") : ""}`}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d4e13]",
                  isActive
                    ? "border-[#2d4e13] bg-[#f0f6e4] ring-2 ring-[#2d4e13] dark:border-[#a8d655] dark:bg-[#202f23]"
                    : "border-[#d5e1d0] bg-white dark:border-[#334238] dark:bg-[#1d2820]",
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl text-[#2d4e13] dark:text-[#bcee68] transition-transform group-hover:scale-110">
                      {puzzle.icon}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
                        puzzle.difficulty === "beginner" &&
                          "bg-emerald-200 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-300",
                        puzzle.difficulty === "intermediate" &&
                          "bg-amber-200 text-amber-950 dark:bg-amber-950/80 dark:text-amber-300",
                        puzzle.difficulty === "master" &&
                          "bg-rose-200 text-rose-950 dark:bg-rose-950/80 dark:text-rose-300",
                      )}
                    >
                      {puzzle.difficultyLabel[lang]}
                    </span>
                  </div>

                  <span className="block mt-5 font-serif text-lg font-semibold text-[#17201c] dark:text-white">
                    {puzzle.title[lang]}
                  </span>
                  <span className="block mt-1.5 text-xs leading-relaxed text-[#3c4a41] dark:text-[#cbd5e1]">
                    {puzzle.desc[lang]}
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#2d4e13] dark:text-[#bcee68]">
                  <span>{isActive ? activeBadgeText : exploreText}</span>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
