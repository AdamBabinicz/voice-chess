// components/chess-board-view.tsx
"use client";

import React, { useState } from "react";
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
  };
}

export function ChessBoardView({
  board,
  selectedSquare,
  onSquareClick,
  blindfold,
  lang = "pl",
  labels,
}: ChessBoardViewProps) {
  const [isPeeking, setIsPeeking] = useState(false);

  const triggerPeek = () => {
    setIsPeeking(true);
    setTimeout(() => setIsPeeking(false), 3000);
  };

  const isHidden = blindfold && !isPeeking;

  const getSquareAriaLabel = (
    squareName: string,
    piece: BoardPiece | null,
  ): string => {
    if (!piece) {
      return lang === "pl"
        ? `Pole ${squareName}, puste`
        : `Square ${squareName}, empty`;
    }

    const colorName =
      lang === "pl"
        ? piece.color === "w"
          ? "biały"
          : "czarny"
        : piece.color === "w"
          ? "white"
          : "black";

    const pieceTypeNamesPl: Record<PieceSymbol, string> = {
      p: "pion",
      n: "skoczek",
      b: "goniec",
      r: "wieża",
      q: "hetman",
      k: "król",
    };

    const pieceTypeNamesEn: Record<PieceSymbol, string> = {
      p: "pawn",
      n: "knight",
      b: "bishop",
      r: "rook",
      q: "queen",
      k: "king",
    };

    const pieceName =
      lang === "pl"
        ? pieceTypeNamesPl[piece.type] || piece.type
        : pieceTypeNamesEn[piece.type] || piece.type;

    return lang === "pl"
      ? `Pole ${squareName}, ${colorName} ${pieceName}`
      : `Square ${squareName}, ${colorName} ${pieceName}`;
  };

  return (
    <div className="w-full min-h-[300px] sm:min-h-[420px]">
      <div
        className="relative aspect-square w-full h-auto min-w-0 overflow-hidden rounded-2xl border border-[#cad7c5] dark:border-[#334238] shadow-inner bg-[#eef4e8]"
        role="region"
        aria-label={
          lang === "pl" ? "Interaktywna szachownica" : "Interactive chess board"
        }
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
                  aria-label={getSquareAriaLabel(squareName, piece)}
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

      {/* Board Footnote / Coordinates - Stała wysokość h-4 zapobiega jakimkolwiek przesunięciom */}
      <div className="mt-3 flex h-4 items-center justify-between text-[10px] font-bold tracking-widest text-[#3c4a41] dark:text-[#cbd5e1]">
        <span>A B C D E F G H</span>
        <span>{labels.hint}</span>
      </div>
    </div>
  );
}
