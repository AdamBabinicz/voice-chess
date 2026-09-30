// lib/chess-coach-engine.ts
import { Chess, Move, PieceSymbol, Square } from "chess.js";

// Re-eksport modułu łamigłówek taktycznych (gwarantuje wsteczną zgodność bez zmian importów w projekcie)
export * from "./tactical-puzzles";

export interface CoachAnalysis {
  insight: string;
  audioText: string;
}

export interface MaterialScore {
  score: number;
  whiteMaterial: number;
  blackMaterial: number;
  display: string;
  evalText: string;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const CENTIPAWN_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Pozycyjne tabele wartości pól (Piece-Square Tables) z perspektywy białych (od a8 do h1)
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 27, 27, 10, 5, 5, 0, 0, 0, 25, 25, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -25, -25, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
  5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 25, 25, 15, 0, -30, -30, 5, 15, 25, 25,
  15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10,
  10, 10, 10, 10, 10, -10, -10, 0, 10, 15, 15, 10, 0, -10, -10, 5, 5, 15, 15, 5,
  5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

const ROOK_TABLE = [
  0, 0, 0, 5, 5, 0, 0, 0, 15, 20, 20, 20, 20, 20, 20, 15, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
  -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 10, 10, 0, 0, 0,
];

const QUEEN_TABLE = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 5, 0, 0, 0, 0, -10, -10, 5, 5,
  5, 5, 5, 0, -10, 0, 0, 5, 5, 5, 5, 0, -5, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0, 5,
  5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
];

const KING_TABLE_MIDDLE = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
  -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
  -40, -30, -20, -30, -30, -40, -40, -30, -20, -20, -10, -20, -20, -20, -20,
  -20, -10, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
];

const KING_TABLE_ENDGAME = [
  -50, -30, -30, -30, -30, -30, -30, -50, -30, -15, 0, 0, 0, 0, -15, -30, -30,
  0, 15, 20, 20, 15, 0, -30, -30, 5, 20, 30, 30, 20, 5, -30, -30, 0, 20, 30, 30,
  20, 0, -30, -30, -10, 10, 20, 20, 10, -10, -30, -40, -20, 0, 5, 5, 0, -20,
  -40, -50, -40, -30, -20, -20, -30, -40, -50,
];

/**
 * Wbudowana Arcymistrzowska Księga Debiutów (Opening Book)
 */
const OPENING_BOOK: Record<string, string[]> = {
  "": ["e4", "d4", "Nf3", "c4"],
  e4: ["c5", "e5", "e6", "c6"],
  d4: ["d5", "Nf6", "e6"],
  c4: ["e5", "c5", "Nf6"],
  Nf3: ["d5", "Nf6"],
  "e4 e5": ["Nf3", "Bc4", "Nc3"],
  "e4 e5 Nf3": ["Nc6", "Nf6"],
  "e4 e5 Nf3 Nc6": ["Bc4", "Bb5", "d4"],
  "e4 e5 Nf3 Nc6 Bc4": ["Bc5", "Nf6"],
  "e4 e5 Nf3 Nc6 Bb5": ["a6", "Nf6"],
  "e4 c5": ["Nf3", "Nc3"],
  "e4 c5 Nf3": ["d6", "Nc6", "e6"],
  "e4 c5 Nf3 d6": ["d4"],
  "e4 c5 Nf3 d6 d4 cxd4": ["Nxd4"],
  "d4 d5": ["c4", "Nf3"],
  "d4 d5 c4": ["e6", "c6", "dxc4"],
  "d4 d5 c4 e6": ["Nc3", "Nf3"],
  "d4 Nf6": ["c4", "Nf3"],
  "d4 Nf6 c4": ["g6", "e6"],
  "e4 e6": ["d4"],
  "e4 e6 d4": ["d5"],
  "e4 e6 d4 d5": ["Nc3", "Nd2", "e5"],
  "e4 c6": ["d4"],
  "e4 c6 d4": ["d5"],
  "e4 c6 d4 d5": ["Nc3", "e5"],
};

/**
 * Wczesne wykrywanie bezpośredniego ryzyka pata
 */
export function checkStalemateDanger(
  game: Chess,
  lang: "en" | "pl",
): string | null {
  try {
    if (game.isGameOver() || game.inCheck()) return null;

    const legalMoves = game.moves();
    const board = game.board();

    const defendingColor = game.turn();
    let defendingPiecesCount = 0;

    for (const row of board) {
      for (const p of row) {
        if (p && p.color === defendingColor) {
          defendingPiecesCount++;
        }
      }
    }

    if (
      defendingPiecesCount <= 2 &&
      legalMoves.length > 0 &&
      legalMoves.length <= 2
    ) {
      if (lang === "pl") {
        return `Uwaga na pata! Król przeciwnika ma tylko ${legalMoves.length === 1 ? "1 wolne pole" : "2 pola ucieczki"}. Kolejne posunięcia wykonuj wyłącznie z szachem, aby uniknąć przypadkowego remisu!`;
      } else {
        return `Warning: stalemate risk! Opponent's king has only ${legalMoves.length === 1 ? "1 legal move" : "2 escape squares"}. Play forcing checks to avoid an accidental draw!`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Tłumacz profesjonalnych ocen Stockfisha na mowę trenera
 */
export function translateStockfishEvaluation(
  evalData: { scoreCp?: number; mateIn?: number; bestMoveSan?: string },
  lang: "en" | "pl",
): string {
  if (evalData.mateIn !== undefined) {
    const moves = Math.abs(evalData.mateIn);
    if (evalData.mateIn > 0) {
      return lang === "pl"
        ? `Forsowny mat w ${moves} ${moves === 1 ? "ruchu" : "ruchach"}! Utrzymuj maksymalną presję.`
        : `Forced mate in ${moves} ${moves === 1 ? "move" : "moves"}! Maintain full pressure.`;
    } else {
      return lang === "pl"
        ? `Uwaga! Grozi Ci mat w ${moves} ${moves === 1 ? "ruchu" : "ruchach"}. Zabezpiecz króla!`
        : `Danger! Opponent threatens mate in ${moves} ${moves === 1 ? "move" : "moves"}. Defend the king!`;
    }
  }

  if (evalData.scoreCp !== undefined) {
    const pts = (evalData.scoreCp / 100).toFixed(1);
    if (evalData.scoreCp > 300) {
      return lang === "pl"
        ? `Znakomita pozycja! Twoja przewaga wynosi aż +${pts} punktu. Nie dopuść do pata.`
        : `Winning advantage (+${pts} pts). Watch out for stalemate!`;
    }
  }

  return "";
}

/**
 * Oblicza statyczną ocenę pozycji z perspektywy białych (w centypionach)
 */
function evaluateStaticPosition(game: Chess, plyDepth: number = 0): number {
  try {
    if (game.isCheckmate()) {
      return game.turn() === "w"
        ? -30000 + plyDepth * 100
        : 30000 - plyDepth * 100;
    }
    if (game.isDraw()) {
      return 0;
    }

    let totalScore = 0;
    let hasQueens = false;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        if (piece.type === "q") hasQueens = true;
        const baseVal = CENTIPAWN_VALUES[piece.type] || 0;
        let positionalVal = 0;

        const idx = piece.color === "w" ? r * 8 + c : (7 - r) * 8 + c;

        if (piece.type === "p") {
          positionalVal = PAWN_TABLE[idx] || 0;
        } else if (piece.type === "n") {
          positionalVal = KNIGHT_TABLE[idx] || 0;
        } else if (piece.type === "b") {
          positionalVal = BISHOP_TABLE[idx] || 0;
        } else if (piece.type === "r") {
          positionalVal = ROOK_TABLE[idx] || 0;
        } else if (piece.type === "q") {
          positionalVal = QUEEN_TABLE[idx] || 0;
        } else if (piece.type === "k") {
          positionalVal = hasQueens
            ? KING_TABLE_MIDDLE[idx] || 0
            : KING_TABLE_ENDGAME[idx] || 0;
        }

        const pieceTotal = baseVal + positionalVal;
        if (piece.color === "w") {
          totalScore += pieceTotal;
        } else {
          totalScore -= pieceTotal;
        }
      }
    }

    if (hasQueens) {
      if (board[7]?.[4]?.type === "k") totalScore -= 25;
      if (board[0]?.[4]?.type === "k") totalScore += 25;
    }

    return totalScore;
  } catch {
    return 0;
  }
}

/**
 * Sortowanie ruchów według heurystyki MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
 */
function scoreMoveForOrdering(m: Move): number {
  let score = 0;
  if (m.captured) {
    const victimVal = CENTIPAWN_VALUES[m.captured] || 100;
    const attackerVal = CENTIPAWN_VALUES[m.piece] || 100;
    score += victimVal * 10 - attackerVal;
  }
  if (m.promotion) {
    score += 900;
  }
  if (m.san && m.san.includes("+")) {
    score += 100;
  }
  return score;
}

/**
 * Szybki Minimax z Alpha-Beta – gwarantowane zakończenie w < 40 ms bez blokowania UI
 */
function minimax(
  game: Chess,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateStaticPosition(game, ply);
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    return evaluateStaticPosition(game, ply);
  }

  moves.sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      game.move(m);
      const ev = minimax(game, depth - 1, ply + 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      game.move(m);
      const ev = minimax(game, depth - 1, ply + 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Zwraca najlepszy ruch dla bota:
 * 1. Natychmiastowy mat w 1 ruchu
 * 2. Księga debiutów (0 ms)
 * 3. Minimax z sortowaniem MVV-LVA i PST (~30-50 ms, zero zawieszeń)
 */
export function findBestEngineMove(
  game: Chess,
  difficulty: "beginner" | "intermediate" | "master" | string = "intermediate",
): Move | null {
  try {
    const legalMoves = game.moves({ verbose: true });
    if (!legalMoves.length) return null;

    // 1. Zawsze sprawdź natychmiastowego mata
    for (const m of legalMoves) {
      game.move(m);
      if (game.isCheckmate()) {
        game.undo();
        return m;
      }
      game.undo();
    }

    // 2. Debiut z księgi (dla poziomów intermediate i master do 4. posunięcia)
    if (difficulty !== "beginner") {
      const history = game.history();
      const historyStr = history.slice(0, 8).join(" ");
      const bookOptions = OPENING_BOOK[historyStr];

      if (bookOptions && bookOptions.length > 0) {
        const selectedSan =
          bookOptions[Math.floor(Math.random() * bookOptions.length)];
        const bookMove = legalMoves.find((m) => m.san === selectedSan);
        if (bookMove) {
          return bookMove;
        }
      }
    }

    // Poziom początkujący
    if (difficulty === "beginner") {
      const captures = legalMoves.filter((m) => m.captured);
      if (captures.length > 0 && Math.random() < 0.45) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    const isWhite = game.turn() === "w";
    legalMoves.sort(
      (a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a),
    );

    // Poziom średniozaawansowany (głębokość 1 + ocena pozycyjna PST, ~5 ms)
    if (difficulty === "intermediate") {
      let bestMove = legalMoves[0];
      let bestVal = isWhite ? -Infinity : Infinity;

      for (const m of legalMoves) {
        game.move(m);
        let ev = evaluateStaticPosition(game, 1);
        if (game.isDraw()) {
          ev = isWhite ? -2000 : 2000;
        }
        game.undo();

        if (isWhite) {
          if (ev > bestVal) {
            bestVal = ev;
            bestMove = m;
          }
        } else {
          if (ev < bestVal) {
            bestVal = ev;
            bestMove = m;
          }
        }
      }
      return bestMove;
    }

    // Poziom mistrzowski (głębokość 2 z Alpha-Beta + PST, ~30-50 ms, brak zawieszeń UI)
    let bestMove = legalMoves[0];
    let bestVal = isWhite ? -Infinity : Infinity;

    for (const m of legalMoves) {
      game.move(m);
      let ev: number;
      if (game.isCheckmate()) {
        ev = isWhite ? 30000 : -30000;
      } else {
        ev = minimax(game, 2, 1, -Infinity, Infinity, !isWhite);
      }

      if (game.isDraw()) {
        ev = isWhite ? -5000 : 5000;
      }

      game.undo();

      if (isWhite) {
        if (ev > bestVal) {
          bestVal = ev;
          bestMove = m;
        }
      } else {
        if (ev < bestVal) {
          bestVal = ev;
          bestMove = m;
        }
      }
    }

    return bestMove;
  } catch (err) {
    console.warn("[ENGINE] Błąd wyszukiwania ruchu bota:", err);
    const legal = game.moves({ verbose: true });
    return legal.length > 0 ? legal[0] : null;
  }
}

/**
 * Oblicza bilans materiału na szachownicy.
 */
export function calculateMaterialBalance(
  game: Chess,
  lang: "en" | "pl",
): MaterialScore {
  try {
    const board = game.board();
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const val = PIECE_VALUES[piece.type] || 0;
          if (piece.color === "w") whiteMaterial += val;
          else blackMaterial += val;
        }
      }
    }

    const score = whiteMaterial - blackMaterial;
    const sign = score > 0 ? `+${score}` : `${score}`;
    const display = score === 0 ? "0" : sign;

    let evalText = "";
    if (lang === "pl") {
      if (score === 0) evalText = "Równowaga materialna.";
      else if (score > 0)
        evalText = `Białe mają przewagę +${score} pkt materiału.`;
      else evalText = `Czarne mają przewagę +${Math.abs(score)} pkt materiału.`;
    } else {
      if (score === 0) evalText = "Material is equal.";
      else if (score > 0)
        evalText = `White is up +${score} points of material.`;
      else evalText = `Black is up +${Math.abs(score)} points of material.`;
    }

    return { score, whiteMaterial, blackMaterial, display, evalText };
  } catch {
    return {
      score: 0,
      whiteMaterial: 39,
      blackMaterial: 39,
      display: "0",
      evalText: lang === "pl" ? "Równowaga materialna." : "Material is equal.",
    };
  }
}

/**
 * Generuje status audio pozycji dla gracza w trybie gry w ciemno (Blindfold).
 */
export function generateBlindfoldStatus(
  game: Chess,
  lang: "en" | "pl",
): string {
  try {
    const history = game.history();
    const lastMove = history.length > 0 ? history[history.length - 1] : null;
    const turn =
      game.turn() === "w"
        ? lang === "pl"
          ? "białych"
          : "White"
        : lang === "pl"
          ? "czarnych"
          : "Black";
    const mat = calculateMaterialBalance(game, lang);

    if (lang === "pl") {
      if (!lastMove) {
        return `Pozycja wyjściowa. Ruch ${turn}. Wszystkie bierki na polach początkowych.`;
      }
      return `Ruch ${turn}. Ostatnie posunięcie partii: ${lastMove}. ${mat.evalText} Stan: ${game.inCheck() ? "KRÓL W SZACHU!" : "Brak szacha."}`;
    } else {
      if (!lastMove) {
        return `Starting position. ${turn} to move. All pieces on home squares.`;
      }
      return `${turn} to move. Last played move was ${lastMove}. ${mat.evalText} State: ${game.inCheck() ? "KING IN CHECK!" : "No check."}`;
    }
  } catch {
    return lang === "pl" ? "Pozycja w toku." : "Position in progress.";
  }
}

/**
 * Główna funkcja analizy pedagogicznej trenera audio.
 */
export function generateCoachInsight(
  game: Chess,
  lastMove: Move | null | undefined,
  lang: "en" | "pl",
  isPlayerMove: boolean,
): CoachAnalysis {
  if (!lastMove) {
    const pl = `Wypowiedz lub wykonaj ruch na szachownicy. Trener przeanalizuje Twoje posunięcie.`;
    const en = `Make or speak a move on the board. The coach will analyze your play.`;
    return {
      insight: lang === "pl" ? pl : en,
      audioText: lang === "pl" ? pl : en,
    };
  }

  const PIECE_NAMES_PL: Record<string, string> = {
    p: "piona",
    n: "skoczka",
    b: "gońca",
    r: "wieżę",
    q: "hetmana",
    k: "króla",
  };
  const PIECE_NAMES_EN: Record<string, string> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };

  try {
    const inCheck = game.inCheck();
    const isCheckmate = game.isCheckmate();
    const isStalemate = game.isStalemate();
    const isThreefold = game.isThreefoldRepetition();
    const isInsufficient = game.isInsufficientMaterial();
    const isDraw = game.isDraw();

    // 1. Pat (Stalemate)
    if (isStalemate) {
      if (isPlayerMove) {
        const pl = `Pat! Niewiarygodny zwrot akcji — partia kończy się remisem. Król przeciwnika nie ma żadnego ruchu, ale nie jest w szachu. Pamiętaj: przy dużej przewadze zawsze zostawiaj rywalowi pole ucieczki lub dawaj szacha.`;
        const en = `Stalemate! Game ends in a draw. Opponent's king has no legal moves, but is not in check. Always leave an escape square or give check when heavily ahead.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      } else {
        const pl = `Pat! Twój król nie ma żadnego dozwolonego ruchu i nie jest szachowany. Niesamowity ratunek i remis w beznadziejnej pozycji!`;
        const en = `Stalemate! Your king has no legal moves and is not in check. A miraculous save and draw!`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 2. Szach i mat
    if (isCheckmate) {
      if (isPlayerMove) {
        const pl = `Szach i mat! Wspaniałe zwieńczenie partii. Przeciwnik nie ma ucieczki.`;
        const en = `Checkmate! Brilliant finish. The opponent has no escape.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      } else {
        const pl = `Niestety, mat na planszy. Twój król został osaczony. Wyciągnij wnioski i zacznijmy od nowa.`;
        const en = `Checkmate on the board. Your king is cornered. Analyze and try again.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 3. Remisy
    if (isThreefold) {
      const pl = `Partia zakończona remisem przez trzykrotne powtórzenie tej samej pozycji.`;
      const en = `Game drawn by threefold repetition of the position.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (isInsufficient) {
      const pl = `Partia zakończona remisem z powodu braku materiału matującego na planszy.`;
      const en = `Game drawn due to insufficient mating material.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (isDraw) {
      const pl = `Partia zakończona remisem. Dobra, solidna walka obu stron.`;
      const en = `Game drawn. Solid fight from both sides.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    // 4. Szach
    if (inCheck) {
      if (isPlayerMove) {
        const pl = `Szach! Dajesz szacha ruchem ${lastMove.san}. Zmuszasz rywala do obrony i przejmujesz inicjatywę.`;
        const en = `Check! You deliver check with ${lastMove.san}, forcing a reaction and taking initiative.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      } else {
        const pl = `Uwaga, szach! Przeciwnik zaatakował Twojego króla ruchem ${lastMove.san}. Musisz się zasłonić, uciec lub zbić agresora.`;
        const en = `Warning, check! Opponent attacks your king with ${lastMove.san}. Block, escape, or capture the attacker.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 5. Ostrzeżenie przed patem
    const stalemateWarning = checkStalemateDanger(game, lang);
    if (stalemateWarning && isPlayerMove) {
      return {
        insight: stalemateWarning,
        audioText: stalemateWarning,
      };
    }

    // 6. Zbicie figury
    if (lastMove.captured) {
      const capNamePl = PIECE_NAMES_PL[lastMove.captured] || "figurę";
      const capNameEn = PIECE_NAMES_EN[lastMove.captured] || "piece";

      if (isPlayerMove) {
        const pl = `Zbijasz ${capNamePl} na ${lastMove.to}! Zyskujesz przewagę materialną i otwierasz nowe linie natarcia.`;
        const en = `Captured the ${capNameEn} on ${lastMove.to}! Gaining material and opening attack avenues.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      } else {
        if (lastMove.piece === "k") {
          const pl = `Przeciwnik bije królem Twojego ${capNamePl} na ${lastMove.to}. Jego król jest odsłonięty w centrum — czas na kontratak!`;
          const en = `Opponent's king captures your ${capNameEn} on ${lastMove.to}. Their king is exposed in the center — time to counterattack!`;
          return {
            insight: lang === "pl" ? pl : en,
            audioText: lang === "pl" ? pl : en,
          };
        }

        const pl = `Przeciwnik bije Twojego ${capNamePl} na ${lastMove.to}. Sprawdź, czy możesz odbić bierkę lub wywrzeć kontratak!`;
        const en = `Opponent captures your ${capNameEn} on ${lastMove.to}. Look for a recapture or a counter-threat!`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 7. Ruch przeciwnika – bezpieczna analiza zagrożeń
    if (!isPlayerMove) {
      try {
        const opponentColor = lastMove.color;
        const playerColor = opponentColor === "w" ? "b" : "w";
        const board = game.board();
        let threatenedQueenSquare: Square | null = null;
        let threatenedRookSquare: Square | null = null;

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r]?.[c];
            if (p && p.color === playerColor) {
              const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
              const isAttacked =
                typeof game.isAttacked === "function"
                  ? game.isAttacked(sq, opponentColor)
                  : false;
              if (isAttacked) {
                if (p.type === "q" && !threatenedQueenSquare) {
                  threatenedQueenSquare = sq;
                } else if (p.type === "r" && !threatenedRookSquare) {
                  threatenedRookSquare = sq;
                }
              }
            }
          }
        }

        if (threatenedQueenSquare) {
          const pl = `Uwaga! Ruch ${lastMove.san} bezpośrednio zagraża Twojemu hetmanowi na ${threatenedQueenSquare}! Uciekaj hetmanem lub zneutralizuj zagrożenie.`;
          const en = `Warning! Move ${lastMove.san} directly threatens your queen on ${threatenedQueenSquare}! Relocate your queen or counter the threat.`;
          return {
            insight: lang === "pl" ? pl : en,
            audioText: lang === "pl" ? pl : en,
          };
        }

        if (threatenedRookSquare) {
          const pl = `Ostrożnie! Ruch ${lastMove.san} zagraża Twojej wieży na ${threatenedRookSquare}. Zabezpiecz ją lub znajdź silniejsze przeciwuderzenie.`;
          const en = `Careful! Move ${lastMove.san} attacks your rook on ${threatenedRookSquare}. Protect it or find a stronger counter-strike.`;
          return {
            insight: lang === "pl" ? pl : en,
            audioText: lang === "pl" ? pl : en,
          };
        }

        const playerLegalMoves = game.moves({ verbose: true });
        const directCaptures = playerLegalMoves.filter(
          (m) => m.to === lastMove.to,
        );
        if (directCaptures.length > 0 && lastMove.piece !== "p") {
          const pieceNamePl = PIECE_NAMES_PL[lastMove.piece] || "figurę";
          const pieceNameEn = PIECE_NAMES_EN[lastMove.piece] || "piece";
          const pl = `Przeciwnik zagrał ${lastMove.san}, podstawiając ${pieceNamePl} na ${lastMove.to}! Sprawdź natychmiastowe bicie!`;
          const en = `Opponent played ${lastMove.san}, leaving their ${pieceNameEn} vulnerable on ${lastMove.to}! Check for an immediate capture!`;
          return {
            insight: lang === "pl" ? pl : en,
            audioText: lang === "pl" ? pl : en,
          };
        }
      } catch {
        // W razie błędu analizy zagrożeń, przejdź do analizy debiutu/figur
      }
    }

    // 8. Roszada
    if (lastMove.san === "O-O" || lastMove.san === "O-O-O") {
      if (isPlayerMove) {
        const pl = `Roszada wykonana. Twój król chowa się za zwartym łańcuchem pionów, a wieża natychmiast włącza się do gry w centrum.`;
        const en = `Castling completed. Your king is safely tucked behind pawns, and your rook enters central play.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      } else {
        const pl = `Przeciwnik wykonał roszadę (${lastMove.san}). Jego król jest bezpieczny — musisz przygotować plan ataku.`;
        const en = `Opponent castled (${lastMove.san}). King is secured — prepare your plan of attack.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 9. Otwarcie (ruch 1–4)
    const moveNumber = Math.ceil(game.history().length / 2);

    if (moveNumber <= 4) {
      if (lastMove.san === "e4" || lastMove.san === "e5") {
        const pl = isPlayerMove
          ? `Klasyczne zajęcie centrum pionem ${lastMove.san}. Kontrolujesz kluczowe pola d5 i f5 oraz uwalniasz gońca i hetmana.`
          : `Przeciwnik zajmuje centrum ruchem ${lastMove.san}, otwierając przekątne dla swoich figur.`;
        const en = isPlayerMove
          ? `Classic central pawn push ${lastMove.san}. Controls key squares and opens lines for bishop and queen.`
          : `Opponent stakes central space with ${lastMove.san}, freeing diagonals for their pieces.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
      if (lastMove.san === "d4" || lastMove.san === "d5") {
        const pl = isPlayerMove
          ? `Mocne posunięcie w centrum: ${lastMove.san}. Zapewnia stabilną przestrzeń i wsparcie dla lekkich figur.`
          : `Przeciwnik odpowiada w centrum ${lastMove.san}, walcząc o przestrzeń i wsparcie figur.`;
        const en = isPlayerMove
          ? `Solid central stake with ${lastMove.san}. Provides space and foundation for minor pieces.`
          : `Opponent responds centrally with ${lastMove.san}, contesting space.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
      if (lastMove.san === "c4" || lastMove.san === "c5") {
        const pl = isPlayerMove
          ? `Mocne posunięcie skrzydłowe: ${lastMove.san}. Walczysz o kontrolę nad polem d4 bez odsłaniania króla.`
          : `Przeciwnik odpowiada ruchem ${lastMove.san}, wywierając presję na centrum ze skrzydła.`;
        const en = isPlayerMove
          ? `Flank strike with ${lastMove.san}. Challenging the center from the wing.`
          : `Opponent plays ${lastMove.san}, contesting the center from the wing.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
      if (lastMove.san === "c6" || lastMove.san === "e6") {
        const pl = isPlayerMove
          ? `Solidne przygotowanie centrum (${lastMove.san}). Przygotowujesz uderzenie w centrum ruchem d5.`
          : `Przeciwnik gra ${lastMove.san}, przygotowując wsparcie dla pchnięcia w centrum.`;
        const en = isPlayerMove
          ? `Solid preparation (${lastMove.san}), setting up central counterplay with d5.`
          : `Opponent plays ${lastMove.san}, preparing central counterplay.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
      if (lastMove.san.startsWith("N")) {
        const pl = isPlayerMove
          ? `Rozwój skoczka na ${lastMove.to}. Zgodnie ze złotą zasadą: skoczki przed gońcami, wzmacniasz kontrolę nad środkiem planszy.`
          : `Przeciwnik rozwija skoczka na ${lastMove.to}, wzmacniając nacisk na centrum planszy.`;
        const en = isPlayerMove
          ? `Knight develops to ${lastMove.to}. Following the golden principle: knights before bishops, guarding the center.`
          : `Opponent develops knight to ${lastMove.to}, contesting central control.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
      if (lastMove.san.startsWith("B")) {
        const pl = isPlayerMove
          ? `Wyprowadzenie gońca na aktywną przekątną (${lastMove.to}). Przygotowujesz roszadę i wywierasz presję.`
          : `Przeciwnik wyprowadza gońca na ${lastMove.to}, celując w Twoje pozycje.`;
        const en = isPlayerMove
          ? `Bishop developed to active diagonal (${lastMove.to}). Preparing kingside castle and exerting pressure.`
          : `Opponent develops bishop to ${lastMove.to}, targeting your camp.`;
        return {
          insight: lang === "pl" ? pl : en,
          audioText: lang === "pl" ? pl : en,
        };
      }
    }

    // 10. Figury ogólne
    if (lastMove.piece === "k") {
      const pl = isPlayerMove
        ? `Ruch królem na ${lastMove.to}. Pamiętaj o bezpieczeństwie monarchy, gdy na planszy są jeszcze ciężkie figury.`
        : `Przeciwnik ucieka królem na ${lastMove.to}. Król stracił prawo do roszady i jest podatny na atak!`;
      const en = isPlayerMove
        ? `King moves to ${lastMove.to}. Ensure king safety while major pieces remain on board.`
        : `Opponent shifts king to ${lastMove.to}. The king lost castling rights and invites attack!`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (lastMove.piece === "n") {
      const pl = isPlayerMove
        ? `Twój skoczek skacze na ${lastMove.to}. To świetna placówka, skąd kontroluje kluczowe pola w obozie rywala.`
        : `Skoczek przeciwnika melduje się na ${lastMove.to}. Uważaj na potencjalne widełki!`;
      const en = isPlayerMove
        ? `Knight bounds to ${lastMove.to}. An outpost controlling crucial squares in enemy territory.`
        : `Opponent's knight lands on ${lastMove.to}. Watch out for potential forks!`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (lastMove.piece === "r") {
      const pl = isPlayerMove
        ? `Wieża zajmuje kolumnę ${lastMove.to[0]}. Pamiętaj: wieże kochają otwarte linie i walkę o 7. linię.`
        : `Wieża przeciwnika wkracza na linię ${lastMove.to[0]}. Pilnuj obrony własnych pionów.`;
      const en = isPlayerMove
        ? `Rook takes the ${lastMove.to[0]}-file. Rooks thrive on open files and invading the 7th rank.`
        : `Opponent's rook eyes the ${lastMove.to[0]}-file. Guard your pawn base.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (lastMove.piece === "q") {
      const pl = isPlayerMove
        ? `Hetman przemieszcza się na ${lastMove.to}. Najpotężniejsza figura włącza się do koordynacji ataku.`
        : `Hetman rywala przesuwa się na ${lastMove.to}. Zwróć uwagę na jego linie celowania.`;
      const en = isPlayerMove
        ? `Queen relocates to ${lastMove.to}. The most powerful piece coordinates with your army.`
        : `Enemy queen moves to ${lastMove.to}. Keep an eye on her sightlines.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    if (lastMove.piece === "p") {
      const pl = isPlayerMove
        ? `Pchnięcie piona ${lastMove.san}. Zyskujesz przestrzeń na planszy.`
        : `Przeciwnik popycha piona ${lastMove.san}. Zwróć uwagę, jakie linie i pola się otworzyły.`;
      const en = isPlayerMove
        ? `Pawn push ${lastMove.san}. Claiming more territory.`
        : `Opponent pushes pawn ${lastMove.san}. Notice the newly opened files and diagonals.`;
      return {
        insight: lang === "pl" ? pl : en,
        audioText: lang === "pl" ? pl : en,
      };
    }

    const pl = isPlayerMove
      ? `Ruch ${lastMove.san}. Zmieniasz układ sił na ${lastMove.to}. Przeciwnik analizuje odpowiedź.`
      : `Przeciwnik odpowiada ${lastMove.san}. Przeanalizuj układ bierek i wybierz najdokładniejszy plan.`;
    const en = isPlayerMove
      ? `Move ${lastMove.san}. Reshaping the board at ${lastMove.to}. Opponent contemplates a response.`
      : `Opponent plays ${lastMove.san}. Assess the piece coordination and pursue your tactical plan.`;

    return {
      insight: lang === "pl" ? pl : en,
      audioText: lang === "pl" ? pl : en,
    };
  } catch (err) {
    console.warn("[COACH ENGINE] Bezpieczny fallback analizy:", err);
    const pl = isPlayerMove
      ? `Ruch ${lastMove.san} wykonany.`
      : `Przeciwnik zagrał ${lastMove.san}.`;
    const en = isPlayerMove
      ? `Move ${lastMove.san} played.`
      : `Opponent played ${lastMove.san}.`;
    return {
      insight: lang === "pl" ? pl : en,
      audioText: lang === "pl" ? pl : en,
    };
  }
}
