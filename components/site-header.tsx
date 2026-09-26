// components/site-header.tsx
import { Crown, Languages, Moon, Settings2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
  onNewGame: () => void;
  onScrollTo: (id: string) => void;
  subline: string;
  navItems: string[];
  settingsLabel: string;
}

export function SiteHeader({
  lang,
  onToggleLang,
  dark,
  onToggleDark,
  onOpenSettings,
  onNewGame,
  onScrollTo,
  subline,
  navItems,
  settingsLabel,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe5dc] bg-[#f7f8f5]/90 backdrop-blur-xl dark:border-[#29332e] dark:bg-[#111613]/90">
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo i nazwa */}
        <button
          type="button"
          className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
          onClick={() => onScrollTo("top")}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#c8ee63] text-stone-950 shadow-sm">
            <Crown className="size-6 stroke-[2.2]" />
          </span>
          <span className="hidden text-sm font-semibold sm:block">
            ChessTactics
            <br />
            <span className="font-normal text-[#65726a] dark:text-[#a1b0a6]">
              {subline}
            </span>
          </span>
        </button>

        {/* Główne linki nawigacji */}
        <nav className="hidden gap-8 text-sm text-[#65726a] dark:text-[#a1b0a6] lg:flex">
          {navItems.map((item, i) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (i === 0) onScrollTo("live-coach");
                if (i === 1) onScrollTo("tactics");
                if (i === 2) onNewGame();
                if (i === 3) onScrollTo("how-it-works");
              }}
              className={cn(
                "transition-colors cursor-pointer hover:text-[#17201c] dark:hover:text-white",
                i === 0 && "font-semibold text-[#17201c] dark:text-white",
              )}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Kontrolki: Język, Motyw, Ustawienia */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center rounded-lg border border-[#d5e1d0] px-3 py-2 text-xs font-bold text-[#65726a] hover:bg-stone-200/50 dark:border-[#2f3d33] dark:text-[#c4d4c8] dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Zmień język"
          >
            <Languages className="mr-1.5 size-4 text-[#789b35]" />
            {lang.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            className="rounded-lg border border-[#d5e1d0] p-2 text-[#65726a] hover:bg-stone-200/50 dark:border-[#2f3d33] dark:text-[#c4d4c8] dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Przełącz motyw"
          >
            {dark ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>

          <Button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 font-medium text-white shadow-sm hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-all cursor-pointer"
            onClick={onOpenSettings}
          >
            <Settings2 className="size-4" />
            <span>{settingsLabel}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
