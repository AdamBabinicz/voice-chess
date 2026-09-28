// lib/chess-coach-engine.ts
import { Chess, Move, PieceSymbol, Square } from "chess.js";

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

export interface TacticalPuzzle {
  id: number;
  title: { pl: string; en: string };
  desc: { pl: string; en: string };
  difficulty: "beginner" | "intermediate" | "master";
  difficultyLabel: { pl: string; en: string };
  icon: string;
  fen: string;
  hint: { pl: string; en: string };
  verify: (san: string) => boolean;
  successText: { pl: string; en: string };
  failureText: { pl: string; en: string };
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

// Pozycyjne tabele wartości pól (Piece-Square Tables)
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
  0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20,
  15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0,
  -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

export const TACTICAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 0,
    title: { pl: "Widełki skoczkiem", en: "Knight Fork" },
    desc: {
      pl: "Atakuj króla i ciężką figurę jednocześnie",
      en: "Attack king and major piece simultaneously",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♞",
    fen: "r1b1k2r/pp1p1ppp/2n1pn2/8/2N1P3/2P5/P1PB1PPP/R3KB1R w KQkq - 0 1",
    hint: {
      pl: "Zadanie: Widełki skoczkiem! Białe zaczynają i zdobywają decydującą przewagę. Znajdź ruch skoczkiem atakujący dwie bierki!",
      en: "Puzzle: Knight Fork! White to move and gain a winning advantage. Find the fork!",
    },
    verify: (san: string) =>
      san.startsWith("Nd6") || san.startsWith("Nc7") || san.includes("d6+"),
    successText: {
      pl: "Genialnie! Znakomite widełki skoczkiem. Król przeciwnika jest w szachu, a jego obrona pęka. Zadanie rozwiązane!",
      en: "Brilliant! Superb knight fork. The enemy king is in check and defense collapses. Puzzle solved!",
    },
    failureText: {
      pl: "Niezły ruch, ale to nie są widełki. Szukaj pola dla skoczka, z którego zaszachuje króla i jednocześnie zaatakuje inną bierkę!",
      en: "Decent move, but that is not the fork. Look for a square where your knight delivers check while attacking another piece!",
    },
  },
  {
    id: 1,
    title: { pl: "Mat na ostatniej linii", en: "Back Rank Mate" },
    desc: {
      pl: "Wykorzystaj zablokowanie króla przez własne piony",
      en: "Exploit king trapped by its own pawns",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♚",
    fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1",
    hint: {
      pl: "Zadanie: Mat na ostatniej linii! Białe zaczynają. Znajdź decydujący cios hetmanem kończący partię matem!",
      en: "Puzzle: Back rank checkmate! White to move and deliver immediate mate!",
    },
    verify: (san: string) =>
      san.includes("Qe8") || san.includes("Qe8#") || san.includes("Qd8"),
    successText: {
      pl: "Szach i mat! Wykorzystujesz słabość 8. linii. Król czarnych został odcięty za własnymi pionami. Zadanie rozwiązane!",
      en: "Checkmate! Exploiting the 8th rank weakness. Black's king was trapped behind its own pawns. Puzzle solved!",
    },
    failureText: {
      pl: "To nie prowadzi do natychmiastowego mata. Spójrz na 8. linię rywala — czy jest tam jakikolwiek obrońca?",
      en: "That does not force immediate mate. Look at the opponent's 8th rank — is there any defender?",
    },
  },
  {
    id: 2,
    title: { pl: "Związanie gońcem", en: "Absolute Pin" },
    desc: {
      pl: "Przygwoźdź figurę wzdłuż przekątnej przed królem",
      en: "Pin heavy pieces along the diagonal",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "♝",
    fen: "4k3/4q3/8/8/8/2B5/4Q3/4K3 w - - 0 1",
    hint: {
      pl: "Zadanie: Związanie gońcem! Wykorzystaj bezwzględne związanie figury przeciwnika przed królem!",
      en: "Puzzle: Absolute pin! Exploit the enemy piece pinned against the king!",
    },
    verify: (san: string) =>
      san.includes("xe7") || san.startsWith("B") || san.includes("Bxe7"),
    successText: {
      pl: "Świetnie! Wykorzystujesz bezwzględne związanie. Związana figura nie może uciec i pada Twoim łupem. Zadanie rozwiązane!",
      en: "Great job! Exploiting the absolute pin. The pinned piece cannot escape and falls to your attack. Puzzle solved!",
    },
    failureText: {
      pl: "Nie wykorzystujesz jeszcze pełnego potencjału związania. Poszukaj zbicia figury stojącej bezpośrednio przed królem!",
      en: "Not quite capitalizing on the pin yet. Look to capture the piece standing directly before the king!",
    },
  },
  {
    id: 3,
    title: { pl: "Szpila wieżą (Rentgen)", en: "Rook Skewer" },
    desc: {
      pl: "Zaatakuj cenniejszą figurę, by zdobyć tę za nią",
      en: "Attack the king to capture the queen behind it",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "♜",
    fen: "4k2q/8/8/8/8/8/8/R5K1 w - - 0 1",
    hint: {
      pl: "Zadanie: Szpila wieżą! Biała wieża widzi króla na e8 i hetmana na h8 w jednej linii. Wykorzystaj ten motyw geometryczny!",
      en: "Puzzle: Rook skewer! The white rook aligns with the king on e8 and queen on h8. Exploit this geometry!",
    },
    verify: (san: string) => san.startsWith("Ra8") || san.includes("Ra8+"),
    successText: {
      pl: "Doskonale! Szach wieżą na a8 zmusza króla do ucieczki, a bezcenny hetman na h8 zostaje bez obrony i pada w kolejnym ruchu!",
      en: "Splendid! The rook check on a8 forces the king away, leaving the unprotected queen on h8 to fall next move!",
    },
    failureText: {
      pl: "To nie jest motyw szpili. Poszukaj ruchu wieżą po otwartej linii, który zaszachuje króla wzdłuż linii jego hetmana!",
      en: "That is not the skewer. Look for a rook move on the open rank checking the king along his queen's rank!",
    },
  },
  {
    id: 4,
    title: { pl: "Atak z odsłony", en: "Discovered Attack" },
    desc: {
      pl: "Odsłoń linię ataku z jednoczesnym szachem",
      en: "Unmask attack line while delivering check",
    },
    difficulty: "master",
    difficultyLabel: { pl: "Mistrz", en: "Master" },
    icon: "⚡",
    fen: "3qk3/8/8/3B4/8/8/8/3QK3 w - - 0 1",
    hint: {
      pl: "Zadanie: Atak z odsłony! Goniec zasłania linię hetmanów d1-d8. Odejdź gońcem z szachem, by w kolejnym ruchu wziąć hetmana za darmo!",
      en: "Puzzle: Discovered attack! The bishop blocks the d-file. Move the bishop with check to win Black's queen next!",
    },
    verify: (san: string) =>
      san.startsWith("Bf7") ||
      san.startsWith("Bh7") ||
      san.startsWith("Bg8") ||
      san.startsWith("Be6") ||
      san.includes("Bf7+"),
    successText: {
      pl: "Arcymistrzowskie posunięcie! Odejście gońca z szachem odsłania zabójczą linię d1-d8. Czarny hetman jest stracony!",
      en: "Grandmaster precision! Moving the bishop with check unmasks the deadly d-file attack. Black's queen is doomed!",
    },
    failureText: {
      pl: "To nie uwalnia pełnej siły ataku z odsłony. Poszukaj takiego odejścia gońcem, które natychmiast zmusi króla do reakcji (szach)!",
      en: "That misses the full punch of the discovered attack. Look for a bishop jump that immediately forces a king response!",
    },
  },
  {
    id: 5,
    title: { pl: "Współpraca bierek (Mat)", en: "Support Checkmate" },
    desc: {
      pl: "Szybki atak na najsłabszy punkt f7",
      en: "Direct strike on the vulnerable f7 square",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♕",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    hint: {
      pl: "Zadanie: Koordynacja ataku! Goniec z c4 celuje w słaby punkt f7, a hetman z f3 czeka na rozkaz. Znajdź natychmiastowego mata!",
      en: "Puzzle: Attack coordination! The bishop on c4 and queen on f3 target f7. Deliver immediate checkmate!",
    },
    verify: (san: string) => san.includes("Qxf7") || san.includes("Qxf7#"),
    successText: {
      pl: "Bum! Szach i mat na f7! Współpraca hetmana i gońca przynosi natychmiastowe zwycięstwo. Zadanie rozwiązane!",
      en: "Boom! Checkmate on f7! Seamless coordination between queen and bishop secures instant victory!",
    },
    failureText: {
      pl: "Brak precyzji. Spójrz na pole f7 — jest bronione wyłącznie przez czarnego króla!",
      en: "Lacks precision. Focus on the f7 square — it is guarded solely by Black's king!",
    },
  },
];

/**
 * Wczesne wykrywanie bezpośredniego ryzyka pata (Gdy samotny król ma tylko 1-2 ruchy)
 */
export function checkStalemateDanger(
  game: Chess,
  lang: "en" | "pl",
): string | null {
  if (game.isGameOver() || game.inCheck()) return null;

  const legalMoves = game.moves();
  const board = game.board();

  // Sprawdzamy liczbę bierek strony broniącej się
  const defendingColor = game.turn();
  let defendingPiecesCount = 0;

  for (const row of board) {
    for (const p of row) {
      if (p && p.color === defendingColor) {
        defendingPiecesCount++;
      }
    }
  }

  // Jeśli rywal ma tylko króla (lub króla i piona) i ma maksymalnie 2 ruchy
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
 * Heurystyka końcówki (Mop-up evaluation)
 */
function evaluateEndgameMopUp(
  board: ({ type: PieceSymbol; color: "w" | "b" } | null)[][],
  winningColor: "w" | "b",
): number {
  let whiteKingPos = { r: 0, c: 0 };
  let blackKingPos = { r: 0, c: 0 };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "k") {
        if (p.color === "w") whiteKingPos = { r, c };
        else blackKingPos = { r, c };
      }
    }
  }

  const losingKing = winningColor === "w" ? blackKingPos : whiteKingPos;
  const winningKing = winningColor === "w" ? whiteKingPos : blackKingPos;

  const losingKingDstFromCenterFile = Math.max(
    3 - losingKing.c,
    losingKing.c - 4,
  );
  const losingKingDstFromCenterRank = Math.max(
    3 - losingKing.r,
    losingKing.r - 4,
  );
  const losingKingCenterDst =
    losingKingDstFromCenterFile + losingKingDstFromCenterRank;

  const distBetweenKings =
    Math.abs(winningKing.c - losingKing.c) +
    Math.abs(winningKing.r - losingKing.r);

  const mopUpScore = losingKingCenterDst * 25 + (14 - distBetweenKings) * 15;
  return winningColor === "w" ? mopUpScore : -mopUpScore;
}

/**
 * Oblicza statyczną ocenę pozycji z perspektywy białych (w centypionach)
 */
function evaluateStaticPosition(game: Chess, plyDepth: number = 0): number {
  if (game.isCheckmate()) {
    return game.turn() === "w"
      ? -30000 + plyDepth * 100
      : 30000 - plyDepth * 100;
  }
  if (game.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  let whiteMat = 0;
  let blackMat = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = CENTIPAWN_VALUES[piece.type] || 0;
      let positionalVal = 0;

      const idx = piece.color === "w" ? r * 8 + c : (7 - r) * 8 + c;

      if (piece.type === "p") {
        positionalVal = PAWN_TABLE[idx] || 0;
      } else if (piece.type === "n") {
        positionalVal = KNIGHT_TABLE[idx] || 0;
      } else if (piece.type === "b") {
        positionalVal = BISHOP_TABLE[idx] || 0;
      }

      const pieceTotal = baseVal + positionalVal;
      if (piece.color === "w") {
        totalScore += pieceTotal;
        if (piece.type !== "k") whiteMat += baseVal;
      } else {
        totalScore -= pieceTotal;
        if (piece.type !== "k") blackMat += baseVal;
      }
    }
  }

  if (whiteMat > blackMat + 400) {
    totalScore += evaluateEndgameMopUp(board, "w");
  } else if (blackMat > whiteMat + 400) {
    totalScore += evaluateEndgameMopUp(board, "b");
  }

  return totalScore;
}

/**
 * Algorytm Minimax z obcinaniem Alpha-Beta i dyskontowaniem głębokości mata
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

  moves.sort((a, b) => {
    let scoreA =
      (a.promotion ? 20 : 0) +
      (a.captured ? 10 : 0) +
      (a.san.includes("+") ? 6 : 0);
    let scoreB =
      (b.promotion ? 20 : 0) +
      (b.captured ? 10 : 0) +
      (b.san.includes("+") ? 6 : 0);
    return scoreB - scoreA;
  });

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
 * Zwraca najlepszy ruch dla bota z bezwzględnym priorytetem zadania mata (Mate-in-1/2)
 */
export function findBestEngineMove(
  game: Chess,
  difficulty: "beginner" | "intermediate" | "master" | string = "intermediate",
): Move | null {
  const legalMoves = game.moves({ verbose: true });
  if (!legalMoves.length) return null;

  for (const m of legalMoves) {
    game.move(m);
    if (game.isCheckmate()) {
      game.undo();
      return m;
    }
    game.undo();
  }

  if (difficulty === "beginner") {
    const captures = legalMoves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() < 0.45) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const isWhite = game.turn() === "w";

  if (difficulty === "intermediate") {
    let bestMove = legalMoves[0];
    let bestVal = isWhite ? -Infinity : Infinity;

    for (const m of legalMoves) {
      game.move(m);
      let ev = evaluateStaticPosition(game, 1);

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
  }

  let bestMove = legalMoves[0];
  let bestVal = isWhite ? -Infinity : Infinity;
  const searchDepth = 3;

  for (const m of legalMoves) {
    game.move(m);
    let ev = minimax(game, searchDepth - 1, 1, -Infinity, Infinity, !isWhite);

    if (game.isDraw()) {
      ev = isWhite ? -8000 : 8000;
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

/**
 * Oblicza bilans materiału na szachownicy.
 */
export function calculateMaterialBalance(
  game: Chess,
  lang: "en" | "pl",
): MaterialScore {
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
    else if (score > 0) evalText = `White is up +${score} points of material.`;
    else evalText = `Black is up +${Math.abs(score)} points of material.`;
  }

  return { score, whiteMaterial, blackMaterial, display, evalText };
}

/**
 * Weryfikuje rozwiązania dla zadań taktycznych w oparciu o bazę TACTICAL_PUZZLES.
 */
export function evaluateTacticalPuzzle(
  puzzleIndex: number,
  moveSan: string,
  lang: "en" | "pl",
): { isCorrect: boolean; insight: string; audioText: string } {
  const puzzle = TACTICAL_PUZZLES[puzzleIndex];

  if (!puzzle) {
    const pl = `Ruch wykonany. Analizuj dalszą pozycję.`;
    const en = `Move executed. Continue analyzing the position.`;
    return { isCorrect: true, insight: pl, audioText: lang === "pl" ? pl : en };
  }

  const isCorrect = puzzle.verify(moveSan);

  if (isCorrect) {
    const text = puzzle.successText[lang];
    return {
      isCorrect: true,
      insight: text,
      audioText: text,
    };
  } else {
    const text = puzzle.failureText[lang];
    return {
      isCorrect: false,
      insight: text,
      audioText: text,
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
}

/**
 * Główna funkcja analizy pedagogicznej trenera audio.
 */
export function generateCoachInsight(
  game: Chess,
  lastMove: Move,
  lang: "en" | "pl",
  isPlayerMove: boolean,
): CoachAnalysis {
  const inCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isThreefold = game.isThreefoldRepetition();
  const isInsufficient = game.isInsufficientMaterial();
  const isDraw = game.isDraw();

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

  // 1. Pat (Stalemate) – bezwzględny priorytet, aby nie mylić go z matem!
  if (isStalemate) {
    if (isPlayerMove) {
      const pl = `Pat! Niewiarygodny zwrot akcji — partia kończy się remisem. Król przeciwnika nie ma żadnego ruchu, ale nie jest w szachu. Wypuszczasz wygraną z rąk! Pamiętaj: przy dużej przewadze zawsze zostawiaj rywalowi pole ucieczki lub dawaj szacha.`;
      const en = `Stalemate! Game ends in a draw. Opponent's king has no legal moves, but is not in check. A dominant win slipped away! Always leave an escape square or give check when heavily ahead.`;
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

  // 2. Szach i mat (wyłącznie gdy król jest rzeczywiście w szachu)
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

  // 3. Pozostałe formy remisu
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

  // 4. Szach (bezwzględny priorytet podczas trwania partii)
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

  // 5. Wczesne ostrzeżenie przed patem (gdy król rywala ma 1-2 ruchy)
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

  // 7. Ruch przeciwnika – precyzyjna analiza zagrożeń dla bierek gracza
  if (!isPlayerMove) {
    const opponentColor = lastMove.color; // 'w' | 'b'
    const playerColor = opponentColor === "w" ? "b" : "w";

    // Sprawdzamy stan szachownicy i zbieramy bierki gracza z ich RZECZYWISTYMI polami
    const board = game.board();
    let threatenedQueenSquare: Square | null = null;
    let threatenedRookSquare: Square | null = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === playerColor) {
          const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;

          // Wykorzystujemy natywną metodę silnika szachowego do weryfikacji ataku
          const isAttacked = game.isAttacked(sq, opponentColor);
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

    // Czy przeciwnik podstawił figurę pod bicie przez gracza?
    const playerLegalMoves = game.moves({ verbose: true });
    const directCaptures = playerLegalMoves.filter((m) => m.to === lastMove.to);
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
}
