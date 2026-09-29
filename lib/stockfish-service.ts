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
  private initPromise: Promise<void> | null = null;
  private currentResolve:
    | ((evalResult: StockfishEvaluation | null) => void)
    | null = null;
  private currentEvaluation: Partial<StockfishEvaluation> = {};
  private evalTimeoutId: number | null = null;

  // Leniwa, bezpieczna inicjalizacja - worker NIE obciąża initial load strony
  private initWorker(): Promise<void> {
    if (this.isReady && this.worker) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      try {
        if (typeof window === "undefined") {
          resolve();
          return;
        }

        this.worker = new Worker("/stockfish.js");

        // Watchdog: jeśli worker nie załaduje się w 2500ms, odblokuj interfejs
        const initFallbackTimeout = window.setTimeout(() => {
          this.isReady = true;
          resolve();
        }, 2500);

        this.worker.onmessage = (event: MessageEvent) => {
          const rawData: string =
            typeof event.data === "string" ? event.data : "";
          const lines = rawData.split("\n");

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // Wykrycie gotowości silnika UCI
            if (
              !this.isReady &&
              (line.includes("uciok") || line.includes("readyok"))
            ) {
              this.isReady = true;
              window.clearTimeout(initFallbackTimeout);
              resolve();
            }

            this.handleUciOutput(line);
          }
        };

        this.worker.onerror = (err) => {
          console.warn("Stockfish Worker error fallback:", err);
          window.clearTimeout(initFallbackTimeout);
          this.isReady = false;
          resolve();
        };

        // Inicjalizacja protokołu UCI
        this.worker.postMessage("uci");
        this.worker.postMessage("isready");
      } catch (err) {
        console.warn("Stockfish Worker initialization fallback:", err);
        resolve();
      }
    });

    return this.initPromise;
  }

  private handleUciOutput(line: string) {
    // 1. Parsowanie oceny pozycji: 'info depth 12 score cp 150 pv e2e4 e7e5...'
    if (line.startsWith("info") && line.includes("score")) {
      const depthMatch = line.match(/depth (\d+)/);
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      const pvMatch = line.match(/pv (.+)/);

      if (depthMatch) {
        this.currentEvaluation.depth = parseInt(depthMatch[1], 10);
      }
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
      if (this.evalTimeoutId) {
        window.clearTimeout(this.evalTimeoutId);
        this.evalTimeoutId = null;
      }

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
      } else {
        if (this.currentResolve) {
          this.currentResolve(null);
          this.currentResolve = null;
        }
      }
    }
  }

  /**
   * Analizuje zadaną pozycję FEN za pomocą Stockfisha.
   * @param fen Pozycja szachowa
   * @param depth Głębokość analizy (domyślnie 10)
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

      if (this.evalTimeoutId) {
        window.clearTimeout(this.evalTimeoutId);
      }

      // Bezpiecznik: jeśli po 1500ms Stockfish nie odda bestmove, zwolnij Promise
      this.evalTimeoutId = window.setTimeout(() => {
        if (this.currentResolve) {
          this.currentResolve(null);
          this.currentResolve = null;
        }
      }, 1500);

      // Zatrzymujemy poprzednie liczenie i zadajemy pozycję
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

    const formattedMove =
      bestMove.length >= 4
        ? `${bestMove.substring(0, 2)}-${bestMove.substring(2, 4)}`
        : bestMove;

    let textPl = "";
    let textEn = "";

    if (mateIn !== undefined) {
      if (mateIn > 0) {
        textPl = `Forsowny mat w ${mateIn} ${mateIn === 1 ? "ruchu" : "ruchach"}! Najlepsze posunięcie to ${formattedMove}. Nie wypuść wygranej!`;
        textEn = `Forced mate in ${mateIn}! Best move is ${formattedMove}. Finish the game cleanly!`;
      } else {
        const mateAbs = Math.abs(mateIn);
        textPl = `Uwaga! Grozi mat w ${mateAbs} ${mateAbs === 1 ? "ruchu" : "ruchach"}! Konieczna natychmiastowa obrona ruchem ${formattedMove}.`;
        textEn = `Warning! Opponent has mate in ${mateAbs}! Immediate defensive move ${formattedMove} required.`;
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
      textPl = `Wyraźna przewaga: ${leader} (+${Math.abs(evalScore).toFixed(1)}). Silnik Stockfish rekomenduje ruch ${formattedMove}.`;
      textEn = `Decisive advantage: ${leader} (+${Math.abs(evalScore).toFixed(1)}). Stockfish recommends ${formattedMove}.`;
    } else if (Math.abs(evalScore) < 0.5) {
      textPl = `Równowaga materialna i pozycyjna (ocena ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Precyzyjny ruch to ${formattedMove}.`;
      textEn = `Balanced position (eval ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Solid continuation is ${formattedMove}.`;
    } else {
      textPl = `Ocena Stockfisha (głębokość ${depth}): ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Rekomendowany ruch: ${formattedMove}.`;
      textEn = `Stockfish eval (depth ${depth}): ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Recommended move: ${formattedMove}.`;
    }

    return {
      insight: lang === "pl" ? textPl : textEn,
      audioText: lang === "pl" ? textPl : textEn,
    };
  }
}

export const stockfishService = new StockfishManager();
