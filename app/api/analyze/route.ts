// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { Chess } from "chess.js";

export const runtime = "nodejs";

interface AnalyzeRequest {
  fen: string;
  history?: string[];
  lang?: "pl" | "en";
}

// Funkcja pomocnicza: ocena materiału i struktury pozycji przez chess.js
function evaluatePosition(game: Chess) {
  const board = game.board();
  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  let whiteScore = 0;
  let blackScore = 0;
  const whitePieces: string[] = [];
  const blackPieces: string[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (square) {
        const val = pieceValues[square.type] || 0;
        if (square.color === "w") {
          whiteScore += val;
          whitePieces.push(square.type);
        } else {
          blackScore += val;
          blackPieces.push(square.type);
        }
      }
    }
  }

  const materialDiff = whiteScore - blackScore;
  const inCheck = game.inCheck();
  const isCheckmate = game.isCheckmate();
  const isDraw = game.isDraw();
  const moves = game.moves({ verbose: true });
  const captureMoves = moves.filter((m) => m.isCapture());

  return {
    materialDiff,
    inCheck,
    isCheckmate,
    isDraw,
    legalMovesCount: moves.length,
    captureMoves: captureMoves.map((m) => m.san),
    turn: game.turn() === "w" ? "white" : "black",
  };
}

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { fen, history = [], lang = "pl" } = body;

    if (!fen || typeof fen !== "string") {
      return NextResponse.json(
        { error: "Brakujący lub nieprawidłowy FEN" },
        { status: 400 },
      );
    }

    // Walidacja i załadowanie pozycji do chess.js
    let game: Chess;
    try {
      game = new Chess(fen);
    } catch {
      return NextResponse.json(
        { error: "Nieprawidłowy zapis FEN pozycji" },
        { status: 400 },
      );
    }

    const pos = evaluatePosition(game);
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Prawdziwa analiza Gemini AI (jeśli klucz jest skonfigurowany)
    if (apiKey) {
      try {
        const turnText = pos.turn === "white" ? "Białych" : "Czarnych";
        const materialDesc =
          pos.materialDiff === 0
            ? "Równowaga materiałowa"
            : pos.materialDiff > 0
              ? `Białe mają przewagę +${pos.materialDiff} pkt`
              : `Czarne mają przewagę +${Math.abs(pos.materialDiff)} pkt`;

        const promptPl = `Działasz jako Arcymistrz Szachowy FIDE i wyrozumiały audio coach.
Analizujesz partię dla zawodnika.
Pozycja (FEN): "${fen}".
Ruch: ${turnText}.
Stan taktyczny:
- Materiał: ${materialDesc}.
- Szach: ${pos.inCheck ? "TAK, król jest atakowany!" : "Nie"}.
- Liczba legalnych posunięć: ${pos.legalMovesCount}.
- Możliwe bicia w tym ruchu: ${pos.captureMoves.slice(0, 5).join(", ") || "brak natychmiastowych bić"}.
- Ostatnie posunięcia: ${history.slice(-4).join(" ") || "początek partii"}.

Sformułuj DOKŁADNIE 2 zwięzłe zdania analizy (maksymalnie 35 słów):
1. Zdanie 1: Konkretna ocena tej pozycji (materialna, bezpieczeństwo króla lub aktywność bierek).
2. Zdanie 2: Jasna wskazówka taktyczna lub strategiczna dla strony na posunięciu.
Wskazówki techniczne: Używaj naturalnego języka szachowego. Żadnych gwiazdek (*), markdownu ani myślników – tekst zostanie odczytany przez syntezator mowy.`;

        const promptEn = `You are a FIDE Grandmaster and voice chess tutor.
Analyzing board position (FEN): "${fen}".
Turn: ${pos.turn.toUpperCase()}.
Tactical breakdown:
- Material: ${pos.materialDiff === 0 ? "Equal" : pos.materialDiff > 0 ? `White +${pos.materialDiff}` : `Black +${Math.abs(pos.materialDiff)}`}.
- In Check: ${pos.inCheck ? "YES" : "No"}.
- Immediate Captures Available: ${pos.captureMoves.slice(0, 5).join(", ") || "None"}.
- Recent moves: ${history.slice(-4).join(" ") || "start of game"}.

Provide EXACTLY 2 short, high-impact pedagogical sentences (max 35 words total):
1. First sentence: Clear tactical diagnosis of this exact position.
2. Second sentence: Direct strategic recommendation for the side to move.
Do not use asterisks (*), markdown, or bullet points — this will be read by browser TTS.`;

        const selectedPrompt = lang === "pl" ? promptPl : promptEn;

        // Prawidłowy oficjalny model: gemini-2.0-flash
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: selectedPrompt }] }],
              generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.3,
              },
            }),
          },
        );

        if (res.ok) {
          const data = await res.json();
          const rawText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (rawText) {
            const cleanText = rawText.replace(/[*_#`]/g, "").trim();
            return NextResponse.json({
              source: "gemini-ai",
              insight: cleanText,
              audioText: cleanText,
            });
          }
        } else {
          const errorDetails = await res.text();
          console.warn("Gemini API HTTP Error:", res.status, errorDetails);
        }
      } catch (geminiError) {
        console.warn(
          "Błąd wywołania Gemini API, przejście do silnika heurystycznego:",
          geminiError,
        );
      }
    }

    // 2. DYNAMICZNY ZAAWANSOWANY SILNIK HEURYSTYCZNY (Niezawodny Fallback)
    // Gdy brak klucza API lub błąd sieci, generuje autentyczną analizę z FEN!
    const isWhite = pos.turn === "white";
    const turnPl = isWhite ? "Białe" : "Czarne";
    const turnEn = isWhite ? "White" : "Black";

    let dynamicInsightPl = "";
    let dynamicInsightEn = "";

    if (pos.isCheckmate) {
      dynamicInsightPl = `Mat na szachownicy! Partia zakończona zwycięstwem ${isWhite ? "czarnych" : "białych"}.`;
      dynamicInsightEn = `Checkmate on the board! Game won by ${isWhite ? "Black" : "White"}.`;
    } else if (pos.inCheck) {
      const escapeMoves = pos.legalMovesCount;
      dynamicInsightPl = `Uwaga, ${turnPl} są w szachu! Konieczna natychmiastowa obrona króla – do dyspozycji jest ${escapeMoves} legalnych odpowiedzi.`;
      dynamicInsightEn = `Warning, ${turnEn} is in check! Immediate king safety is required with ${escapeMoves} legal responses available.`;
    } else if (pos.captureMoves.length > 0) {
      const topCapture = pos.captureMoves[0];
      dynamicInsightPl = `Ruch ${turnPl.toLowerCase()}. W pozycji wisi bezpośrednie spięcie taktyczne – warto rozważyć bicie ${topCapture} lub obronę atakowanej linii.`;
      dynamicInsightEn = `${turnEn} to move. Direct tactical tension on the board – examine capture ${topCapture} or defend the contested line.`;
    } else if (pos.materialDiff !== 0) {
      const leadPl = pos.materialDiff > 0 ? "Białe mają" : "Czarne mają";
      const leadEn = pos.materialDiff > 0 ? "White holds" : "Black holds";
      const absDiff = Math.abs(pos.materialDiff);
      dynamicInsightPl = `${leadPl} przewagę materialną wynoszącą ${absDiff} punktów. Ruch ${turnPl.toLowerCase()} – dąż do uproszczenia pozycji lub zabezpieczenia słabych punktów.`;
      dynamicInsightEn = `${leadEn} a ${absDiff}-point material advantage. ${turnEn} to move – look to consolidate and exploit open weaknesses.`;
    } else {
      dynamicInsightPl = `Równowaga na szachownicy. ${turnPl} powinny skupić się na koordynacji figur lekkich i walce o dominację w centrum.`;
      dynamicInsightEn = `Equal material balance. ${turnEn} should prioritize piece coordination and fight for central outpost control.`;
    }

    const fallbackResult = lang === "pl" ? dynamicInsightPl : dynamicInsightEn;

    return NextResponse.json({
      source: "chess-engine-heuristic",
      insight: fallbackResult,
      audioText: fallbackResult,
    });
  } catch (error) {
    console.error("Critical error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas analizy pozycji." },
      { status: 500 },
    );
  }
}
