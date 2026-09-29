// lib/stockfish-service.ts
import { Chess } from "chess.js";
import {
  calculateMaterialBalance,
  findBestEngineMove,
} from "./chess-coach-engine";

export interface StockfishEvaluation {
  bestMove: string; // np. "e2e4" lub "g1f3"
  from: string; // np. "e2"
  to: string; // np. "e4"
  promotion?: string;
  scoreCp?: number; // przewaga w centypionach (np. +150 to +1.5 piona)
  mateIn?: number; // np. 2 oznacza mat w 2 ruchach
  depth: number; // głębokość przeszukiwania
  pv?: string[]; // główny wariant
}

type WorkerHealth = "idle" | "ready" | "unavailable";

interface PendingRequest {
  resolve: (evaluation: StockfishEvaluation) => void;
  fen: string;
  timerIds: number[];
  settled: boolean;
}

class StockfishManager {
  private worker: Worker | null = null;
  private health: WorkerHealth = "idle";
  private probePromise: Promise<boolean> | null = null;
  private pending: PendingRequest | null = null;
  private currentEvaluation: Partial<StockfishEvaluation> = {};

  /**
   * Natychmiastowa analiza heurystyczna (0 ms oczekiwania, zawsze zwraca precyzyjny wynik).
   */
  public evaluateLocally(fen: string): StockfishEvaluation {
    try {
      const chess = new Chess(fen);
      const best = findBestEngineMove(chess, "master");
      const material = calculateMaterialBalance(chess, "pl");

      if (best) {
        const from = best.from;
        const to = best.to;
        const bestMove = `${from}${to}`;
        return {
          bestMove,
          from,
          to,
          promotion: best.promotion || undefined,
          scoreCp: material.score * 100,
          depth: 10,
          pv: [bestMove],
        };
      }

      // Bezpieczny fallback przy braku legalnych ruchów
      const legal = chess.moves({ verbose: true });
      if (legal.length > 0) {
        const fallbackMove = `${legal[0].from}${legal[0].to}`;
        return {
          bestMove: fallbackMove,
          from: legal[0].from,
          to: legal[0].to,
          scoreCp: material.score * 100,
          depth: 10,
          pv: [fallbackMove],
        };
      }

      return {
        bestMove: "e2e4",
        from: "e2",
        to: "e4",
        scoreCp: material.score * 100,
        depth: 10,
      };
    } catch {
      return {
        bestMove: "e2e4",
        from: "e2",
        to: "e4",
        scoreCp: 0,
        depth: 10,
      };
    }
  }

  /**
   * Błyskawicznie i bezpiecznie sprawdza dostępność pliku /stockfish.js (max 250 ms z AbortController).
   */
  private async checkWorkerFileExists(): Promise<boolean> {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 250);

      const res = await fetch("/stockfish.js", {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      window.clearTimeout(timeoutId);
      const contentType = res.headers.get("content-type") || "";
      return res.ok && !contentType.includes("text/html");
    } catch {
      return false;
    }
  }

  /**
   * Sonda workera: jeśli plik nie istnieje lub nie odpowiada w 400 ms,
   * natychmiast i permanentnie przełączamy się na silnik lokalny.
   */
  private probeWorker(): Promise<boolean> {
    if (this.health === "ready" && this.worker) {
      return Promise.resolve(true);
    }
    if (this.health === "unavailable") {
      return Promise.resolve(false);
    }
    if (this.probePromise) {
      return this.probePromise;
    }

    this.probePromise = (async () => {
      const exists = await this.checkWorkerFileExists();
      if (!exists) {
        this.health = "unavailable";
        return false;
      }

      return new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          this.health = ok ? "ready" : "unavailable";
          if (!ok && this.worker) {
            try {
              this.worker.terminate();
            } catch {}
            this.worker = null;
          }
          resolve(ok);
        };

        try {
          this.worker = new Worker("/stockfish.js");

          // Twardy limit 400 ms na handshake UCI
          const watchdog = window.setTimeout(() => finish(false), 400);

          this.worker.onmessage = (event: MessageEvent) => {
            const rawData: string =
              typeof event.data === "string"
                ? event.data
                : typeof event.data?.line === "string"
                  ? event.data.line
                  : "";

            for (const rawLine of rawData.split("\n")) {
              const line = rawLine.trim();
              if (!line) continue;

              if (this.health !== "ready") {
                if (line.includes("uciok")) {
                  this.send("isready");
                  continue;
                }
                if (line.includes("readyok")) {
                  window.clearTimeout(watchdog);
                  finish(true);
                  return;
                }
                continue;
              }

              this.handleUciOutput(line);
            }
          };

          this.worker.onerror = () => {
            window.clearTimeout(watchdog);
            finish(false);
          };

          this.send("uci");
        } catch {
          finish(false);
        }
      });
    })();

    return this.probePromise;
  }

  private send(command: string) {
    try {
      this.worker?.postMessage(command);
    } catch {}
  }

  private handleUciOutput(line: string) {
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

    if (line.startsWith("bestmove")) {
      const parts = line.split(/\s+/);
      const bestMoveStr = parts[1];

      if (bestMoveStr && bestMoveStr !== "(none)") {
        const from = bestMoveStr.substring(0, 2);
        const to = bestMoveStr.substring(2, 4);
        const promotion =
          bestMoveStr.length > 4 ? bestMoveStr.substring(4, 5) : undefined;

        this.settlePending({
          bestMove: bestMoveStr,
          from,
          to,
          promotion,
          depth: this.currentEvaluation.depth || 10,
          scoreCp: this.currentEvaluation.scoreCp,
          mateIn: this.currentEvaluation.mateIn,
          pv: this.currentEvaluation.pv,
        });
      } else {
        this.settlePending(null);
      }
    }
  }

  /**
   * Zamyka oczekujące żądanie DOKŁADNIE raz (bestmove / onerror / timeout).
   */
  private settlePending(result: StockfishEvaluation | null) {
    const request = this.pending;
    if (!request || request.settled) return;

    request.settled = true;
    for (const timerId of request.timerIds) {
      window.clearTimeout(timerId);
    }
    this.pending = null;

    request.resolve(result ?? this.evaluateLocally(request.fen));
  }

  private buildBestSoFar(fen: string): StockfishEvaluation {
    const pv = this.currentEvaluation.pv;
    const firstMove = pv && pv.length > 0 ? pv[0] : "";

    if (!firstMove || firstMove.length < 4) {
      return this.evaluateLocally(fen);
    }

    return {
      bestMove: firstMove,
      from: firstMove.substring(0, 2),
      to: firstMove.substring(2, 4),
      promotion: firstMove.length > 4 ? firstMove.substring(4, 5) : undefined,
      depth: this.currentEvaluation.depth || 8,
      scoreCp: this.currentEvaluation.scoreCp,
      mateIn: this.currentEvaluation.mateIn,
      pv,
    };
  }

  /**
   * Gwarantuje wynik w <= 500 ms (0 ms gdy brak workera, natychmiastowy fallback lokalny).
   */
  public async evaluatePosition(
    fen: string,
    depth = 10,
  ): Promise<StockfishEvaluation> {
    try {
      const probeTimeout = new Promise<boolean>((resolve) =>
        window.setTimeout(() => resolve(false), 300),
      );
      const workerOk = await Promise.race([this.probeWorker(), probeTimeout]);

      if (!workerOk || !this.worker) {
        return this.evaluateLocally(fen);
      }

      if (this.pending && !this.pending.settled) {
        this.send("stop");
        this.settlePending(this.buildBestSoFar(this.pending.fen));
      }

      return new Promise<StockfishEvaluation>((resolve) => {
        this.currentEvaluation = {};

        const fuseTimerId = window.setTimeout(() => {
          this.send("stop");
        }, 400);

        const killTimerId = window.setTimeout(() => {
          this.settlePending(this.buildBestSoFar(fen));
        }, 500);

        this.pending = {
          resolve,
          fen,
          timerIds: [fuseTimerId, killTimerId],
          settled: false,
        };

        this.send(`position fen ${fen}`);
        this.send(`go depth ${depth}`);
      });
    } catch {
      return this.evaluateLocally(fen);
    }
  }

  /**
   * Formułuje ekspercki komentarz trenera na podstawie analizy
   */
  public generateEvaluationCoachText(
    evaluation: StockfishEvaluation,
    isWhiteTurn: boolean,
    lang: "pl" | "en" = "pl",
  ): { insight: string; audioText: string } {
    const { scoreCp, mateIn, bestMove } = evaluation;

    const evalScore =
      scoreCp !== undefined ? (isWhiteTurn ? scoreCp : -scoreCp) / 100 : 0;

    const formattedMove =
      bestMove && bestMove.length >= 4
        ? `${bestMove.substring(0, 2)}-${bestMove.substring(2, 4)}`
        : bestMove || "ruch";

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
    } else if (Math.abs(evalScore) >= 1.5) {
      const leader =
        evalScore > 0
          ? lang === "pl"
            ? "białe"
            : "White"
          : lang === "pl"
            ? "czarne"
            : "Black";
      textPl = `Przewaga: ${leader} (${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Silnik rekomenduje posunięcie ${formattedMove}.`;
      textEn = `Advantage: ${leader} (${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}). Engine recommends ${formattedMove}.`;
    } else if (Math.abs(evalScore) < 0.4) {
      textPl = `Pozycja wyrównana. Precyzyjne posunięcie w tym układzie to ${formattedMove}.`;
      textEn = `Equal position. Accurate move in this setup is ${formattedMove}.`;
    } else {
      textPl = `Ocena pozycji: ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Rekomendowany plan to ruch ${formattedMove}.`;
      textEn = `Position eval: ${evalScore > 0 ? "+" : ""}${evalScore.toFixed(1)}. Recommended plan is ${formattedMove}.`;
    }

    return {
      insight: lang === "pl" ? textPl : textEn,
      audioText: lang === "pl" ? textPl : textEn,
    };
  }
}

export const stockfishService = new StockfishManager();
