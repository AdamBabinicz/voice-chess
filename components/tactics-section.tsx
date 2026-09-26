// components/tactics-section.tsx
import { ChevronRight } from "lucide-react";
import { TACTICAL_PUZZLES, TacticalPuzzle } from "@/lib/chess-coach-engine";
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

export function TacticsSection({
  lang,
  activePuzzle,
  onSelectPuzzle,
  title,
  subtitle,
  exploreText,
  activeBadgeText,
}: TacticsSectionProps) {
  return (
    <section
      id="tactics"
      className="border-y border-[#dfe5dc] bg-[#eef3ea] dark:border-[#29332e] dark:bg-[#172019]"
    >
      <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#68756c] dark:text-[#aebbb0] sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TACTICAL_PUZZLES.map((puzzle: TacticalPuzzle, i: number) => {
            const isActive = activePuzzle === i;
            return (
              <button
                key={puzzle.id}
                type="button"
                onClick={() => onSelectPuzzle(i)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer",
                  isActive
                    ? "border-[#789b35] bg-[#f0f6e4] ring-2 ring-[#789b35] dark:border-[#a8d655] dark:bg-[#202f23]"
                    : "border-[#d5e1d0] bg-white dark:border-[#334238] dark:bg-[#1d2820]",
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl text-[#789b35] transition-transform group-hover:scale-110">
                      {puzzle.icon}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
                        puzzle.difficulty === "beginner" &&
                          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
                        puzzle.difficulty === "intermediate" &&
                          "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
                        puzzle.difficulty === "master" &&
                          "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300",
                      )}
                    >
                      {puzzle.difficultyLabel[lang]}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-lg font-semibold text-[#17201c] dark:text-white">
                    {puzzle.title[lang]}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#78857d] dark:text-[#a0afa5]">
                    {puzzle.desc[lang]}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#789b35]">
                  <span>{isActive ? activeBadgeText : exploreText}</span>
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
