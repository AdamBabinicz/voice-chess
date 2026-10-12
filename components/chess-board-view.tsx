// components/chess-board-view.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PieceSymbol, Color } from "chess.js";
import { ChessPiece } from "@/components/chess-piece";
import { cn } from "@/lib/utils";

interface BoardPiece {
  square: string;
  type: PieceSymbol;
  color: Color;
}

interface ChessBoardViewProps {
  board: (BoardPiece | null)[][];
  selectedSquare: number | null;
  onSquareClick: (index: number) => void;
  blindfold: boolean;
  lang?: "en" | "pl";
  labels: {
    blind: string;
    peek: string;
    hint: string;
    blindfoldDesc: string;
    boardAriaLabel?: string;
  };
}

const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

const TRANSLATIONS = {
  pl: {
    boardAria: "Interaktywna szachownica",
    empty: "puste",
    selectedSuffix: ", wybrane",
    squarePrefix: "Pole",
    white: "biały",
    black: "czarny",
    pieces: {
      p: "pion",
      n: "skoczek",
      b: "goniec",
      r: "wieża",
      q: "hetman",
      k: "król",
    },
  },
  en: {
    boardAria: "Interactive chess board",
    empty: "empty",
    selectedSuffix: ", selected",
    squarePrefix: "Square",
    white: "white",
    black: "black",
    pieces: {
      p: "pawn",
      n: "knight",
      b: "bishop",
      r: "rook",
      q: "queen",
      k: "king",
    },
  },
} as const;

export function ChessBoardView({
  board,
  selectedSquare,
  onSquareClick,
  blindfold,
  lang = "pl",
  labels,
}: ChessBoardViewProps) {
  const [isPeeking, setIsPeeking] = useState(false);
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.pl;

  useEffect(() => {
    return () => {
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current);
      }
    };
  }, []);

  const triggerPeek = () => {
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
    }
    setIsPeeking(true);
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeeking(false);
      peekTimeoutRef.current = null;
    }, 3000);
  };

  const isHidden = blindfold && !isPeeking;

  const getSquareAriaLabel = (
    squareName: string,
    piece: BoardPiece | null,
    isSelected: boolean,
  ): string => {
    const selectedSuffix = isSelected ? t.selectedSuffix : "";

    if (!piece) {
      return `${t.squarePrefix} ${squareName}, ${t.empty}${selectedSuffix}`;
    }

    const colorName = piece.color === "w" ? t.white : t.black;
    const pieceName = t.pieces[piece.type] || piece.type;

    return `${t.squarePrefix} ${squareName}, ${colorName} ${pieceName}${selectedSuffix}`;
  };

  return (
    <div className="w-full min-h-[300px] sm:min-h-[420px]">
      {/* Kontener szachownicy i zewnętrznych oznaczeń */}
      <div className="grid grid-cols-[1.25rem_1fr] sm:grid-cols-[1.5rem_1fr]">
        {/* Kolumna z cyframi (8..1) po lewej stronie planszy */}
        <div
          className="grid grid-rows-8 self-stretch pr-1 sm:pr-1.5 select-none"
          aria-hidden="true"
        >
          {RANKS.map((rank) => (
            <span
              key={rank}
              className="flex items-center justify-center text-xs sm:text-sm font-bold text-[#3c4a41] dark:text-[#cbd5e1]"
            >
              {rank}
            </span>
          ))}
        </div>

        {/* Plansza szachowa 8x8 */}
        <div
          className="relative aspect-square w-full h-auto min-w-0 overflow-hidden rounded-2xl border border-[#cad7c5] dark:border-[#334238] shadow-inner bg-[#eef4e8]"
          role="region"
          aria-label={labels.boardAriaLabel || t.boardAria}
        >
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {board.flatMap((row, rowIndex) =>
              row.map((piece, columnIndex) => {
                const i = rowIndex * 8 + columnIndex;
                const isLight = (rowIndex + columnIndex) % 2 === 0;
                const isSelected = selectedSquare === i;
                const squareName = `${String.fromCharCode(97 + columnIndex)}${8 - rowIndex}`;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSquareClick(i)}
                    aria-pressed={isSelected}
                    aria-label={getSquareAriaLabel(
                      squareName,
                      piece,
                      isSelected,
                    )}
                    className={cn(
                      "relative flex h-full w-full items-center justify-center overflow-hidden p-0.5 select-none focus:outline-none focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-[#a4d847] focus-visible:ring-inset transition-colors cursor-pointer",
                      isLight ? "bg-[#eef4e8]" : "bg-[#a8c283]",
                      isSelected &&
                        "ring-4 ring-inset ring-[#d5f57b] bg-[#dcf0a5]",
                    )}
                  >
                    {piece && (
                      <span
                        className={cn(
                          "flex h-full w-full items-center justify-center transition-all duration-150",
                          isHidden && "opacity-0 scale-75",
                        )}
                      >
                        <ChessPiece type={piece.type} color={piece.color} />
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* Blindfold Overlay */}
          {isHidden && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-950/85 p-6 text-center backdrop-blur-md">
              <EyeOff className="mb-3 size-10 text-[#a8d655]" />
              <h4 className="text-base font-bold text-white font-serif">
                {labels.blind}
              </h4>
              <p className="mt-1 text-xs text-stone-300 max-w-[220px] leading-relaxed">
                {labels.blindfoldDesc}
              </p>
              <button
                type="button"
                onClick={triggerPeek}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#c8ee63] px-3.5 py-1.5 text-xs font-bold text-stone-950 shadow-md hover:bg-[#b8de53] active:scale-95 transition-all cursor-pointer"
              >
                <Eye className="size-3.5" />
                <span>{labels.peek}</span>
              </button>
            </div>
          )}
        </div>

        {/* Pusty narożnik pod cyframi */}
        <div aria-hidden="true" />

        {/* Wiersz z literami (A..H) pod szachownicą */}
        <div
          className="grid grid-cols-8 pt-1.5 sm:pt-2 select-none"
          aria-hidden="true"
        >
          {FILES.map((file) => (
            <span
              key={file}
              className="flex items-center justify-center text-xs sm:text-sm font-bold text-[#3c4a41] dark:text-[#cbd5e1]"
            >
              {file}
            </span>
          ))}
        </div>
      </div>

      {/* Podpis / wskazówka użytkownika */}
      {labels.hint && (
        <div className="mt-2.5 flex items-center justify-end text-xs font-medium text-[#3c4a41]/80 dark:text-[#cbd5e1]/80">
          <span>{labels.hint}</span>
        </div>
      )}
    </div>
  );
}
