// lib/stockfish-service.ts

export interface StockfishEvaluation {
  bestMove: string; // np. "e2e4" lub "g1f3"
  from: string; // np. "e2"
  to: string; // np. "e4"
  promotion?: string;
  scoreCp?: number; // przewaga w centypionach (np. +150 to +1.5 piona)
  mateIn?: number; // np. 2 oznacza mat w 2 ruchach
  depth: number; // głębokość przeszukiwania
  pv?: string[]; // główny wariant (linia ruchów)
}

class StockfishManager {
  private worker: Worker | null = null;
  private isReady = false;
  private currentResolve: ((evalResult: StockfishEvaluation) => void) | null =
    null;
  private currentEvaluation: Partial<StockfishEvaluation> = {};

  // Leniwa inicjalizacja - worker NIE obciąża initial load strony
  private initWorker(): Promise<void> {
    if (this.worker && this.isReady) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        if (typeof window === "undefined") return;

        this.worker = new Worker("/stockfish.js");

        this.worker.onmessage = (event: MessageEvent) => {
          const line: string = typeof event.data === "string" ? event.data : "";
          this.handleUciOutput(line);
        };

        this.worker.postMessage("uci");

        // Po potwierdzeniu 'readyok' uznajemy silnik za gotowy
        const checkReady = (e: MessageEvent) => {
          const msg = typeof e.data === "string" ? e.data : "";
          if (msg.includes("readyok") || msg.includes("uciok")) {
            this.isReady = true;
            resolve();
          }
        };

        this.worker.addEventListener("message", checkReady, { once: true });
        this.worker.postMessage("isready");
      } catch (err) {
        console.warn("Stockfish Worker initialization fallback:", err);
        resolve();
      }
    });
  }

  private handleUciOutput(line: string) {
    // 1. Parsowanie oceny pozycji: 'info depth 12 score cp 150 pv e2e4 e7e5...'
    if (line.startsWith("info") && line.includes("score")) {
      const depthMatch = line.match(/depth (\d+)/);
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      const pvMatch = line.match(/pv (.+)/);

      if (depthMatch)
        this.currentEvaluation.depth = parseInt(depthMatch[1], 10);
      if (cpMatch) {
        this.currentEvaluation.scoreCp = parseInt(cpMatch[1], 10);
        this.currentEvaluation.mateIn = undefined;
      }
      if (mateMatch) {
        this.currentEvaluation.mateIn = parseInt(mateMatch[1], 10);
        this.currentEvaluation.scoreCp = undefined;
      }
      if (pvMatch) {
        this.currentEvaluation.pv = pvMatch[1].trim().split(" ");
      }
    }

    // 2. Finalny ruch: 'bestmove e2e4 ponder e7e5'
    if (line.startsWith("bestmove")) {
      const parts = line.split(" ");
      const bestMoveStr = parts[1];

      if (bestMoveStr && bestMoveStr !== "(none)") {
        const from = bestMoveStr.substring(0, 2);
        const to = bestMoveStr.substring(2, 4);
        const promotion =
          bestMoveStr.length > 4 ? bestMoveStr.substring(4, 5) : undefined;

        const finalResult: StockfishEvaluation = {
          bestMove: bestMoveStr,
          from,
          to,
          promotion,
          depth: this.currentEvaluation.depth || 10,
          scoreCp: this.currentEvaluation.scoreCp,
          mateIn: this.currentEvaluation.mateIn,
          pv: this.currentEvaluation.pv,
        };

        if (this.currentResolve) {
          this.currentResolve(finalResult);
          this.currentResolve = null;
        }
      }
    }
  }

  /**
   * Analizuje zadaną pozycję FEN za pomocą Stockfisha.
   * @param fen Pozycja szachowa
   * @param depth Głębokość analizy (domyślnie 10 dla błyskawicznej odpowiedzi ~100-250ms)
   */
  public async evaluatePosition(
    fen: string,
    depth = 10,
  ): Promise<StockfishEvaluation | null> {
    await this.initWorker();

    if (!this.worker) return null;

    return new Promise((resolve) => {
      this.currentResolve = resolve;
      this.currentEvaluation = {};

      // Zatrzymujemy ewentualne poprzednie liczenie i ustawiamy pozycję
      this.worker!.postMessage("stop");
      this.worker!.postMessage(`position fen ${fen}`);
      this.worker!.postMessage(`go depth ${depth}`);
    });
  }

  /**
   * Formułuje ekspercki komentarz trenera na podstawie analizy Stockfisha
   */
  public generateEvaluationCoachText(
    evaluation: StockfishEvaluation,
    isWhiteTurn: boolean,
    lang: "pl" | "en" = "pl",
  ): { insight: string; audioText: string } {
    const { scoreCp, mateIn, bestMove, depth } = evaluation;

    // Przeliczenie centypionów na perspektywę białych
    const evalScore =
      scoreCp !== undefined ? (isWhiteTurn ? scoreCp : -scoreCp) / 100 : 0;

    let textPl = "";
    let textEn = "";

    if (mateIn !== undefined) {
      if (mateIn > 0) {
        textPl = `Forsowny mat w ${mateIn} ${mateIn === 1 ? "ruchu" : "ruchach"}! Najlepsze posunięcie to ${bestMove}. Nie wypuść wygranej!`;
        textEn = `Forced mate in ${mateIn}! Best move is ${bestMove}. Finish the game cleanly!`;
      } else {
        const mateAbs = Math.abs(mateIn);
        textPl = `Uwaga! Grozi mat w ${mateAbs} ${mateAbs === 1 ? "ruchu" : "ruchach"}! Konieczna natychmiastowa obrona posunięciem ${bestMove}.`;
        textEn = `Warning! Opponent has mate in ${mateAbs}! Immediate defensive move ${bestMove} required.`;
      }
    } else if (Math.abs(evalScore) > 3.0) {
      const leader =
        evalScore > 0
          ? lang === "pl"
            ? "białe"
            : "White"
          : lang === "pl"
            ? "czarne"
            : "Black";
      textPl = `Wyraźna przewaga: ${leader} (+${Math.abs(evalScore).toFixed(1)}). Silnik Stockfish rekomenduje ruch ${bestMove}.`;
      textEn = `Decisive advantage: ${leader} (+${Math.abs(evalScore).toFixed(1)}). Stockfish recommends ${bestMove}.`;
    } else if (Math.abs(evalScore) < 0.5) {
      textPl = `Równowaga materialna i pozycyjna (ocena ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Precyzyjny ruch to ${bestMove}.`;
      textEn = `Balanced position (eval ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Solid continuation is ${bestMove}.`;
    } else {
      textPl = `Ocena Stockfisha (głębokość ${depth}): ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Rekomendowany ruch: ${bestMove}.`;
      textEn = `Stockfish eval (depth ${depth}): ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Recommended move: ${bestMove}.`;
    }

    return {
      insight: lang === "pl" ? textPl : textEn,
      audioText: lang === "pl" ? textPl : textEn,
    };
  }
}

export const stockfishService = new StockfishManager();
