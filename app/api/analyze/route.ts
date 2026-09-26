// app/api/analyze/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AnalyzeRequest {
  fen: string;
  history?: string[];
  lang?: "pl" | "en";
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

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Bezpośrednie wywołanie REST API Gemini (zero dodatkowych zależności npm)
    if (apiKey) {
      try {
        const prompt =
          lang === "pl"
            ? `Działasz jako Arcymistrz Szachowy FIDE i wyrozumiały pedagog audio.
Oto aktualna pozycja w formacie FEN: "${fen}".
Ostatnie ruchy w partii: ${history.slice(-6).join(" ") || "Brak ruchów (pozycja początkowa)"}.

Wygeneruj dokładnie 2 krótkie, konkretne i motywujące zdania analizy strategicznej dla zawodnika (maksymalnie 40 słów łącznie):
1. Pierwsze zdanie: diagnoza pozycji (kto ma inicjatywę, które figury są aktywne, gdzie jest słabość).
2. Drugie zdanie: konkretna rada taktyczno-pozycyjna lub plan działania na najbliższe ruchy.

Pisz naturalną, profesjonalną polszczyzną szachową. Nie używaj gwiazdek, pogrubień ani formatowania Markdown – tekst będzie czytany na głos przez syntezator mowy.`
            : `You are a FIDE Grandmaster and supportive audio chess coach.
Current board position in FEN: "${fen}".
Recent game moves: ${history.slice(-6).join(" ") || "None (initial position)"}.

Generate exactly 2 concise, pedagogical, and inspiring sentences of strategic analysis (max 40 words total):
1. First sentence: positional diagnosis (who holds initiative, key active pieces, weaknesses).
2. Second sentence: actionable tactical or positional plan for the upcoming moves.

Use clean, natural spoken chess terminology. Do not use asterisks, markdown, or bullet points — this text will be read aloud by browser text-to-speech.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                maxOutputTokens: 120,
                temperature: 0.4,
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
        }
      } catch (geminiError) {
        console.warn(
          "Fallback do lokalnej heurystyki Arcymistrza:",
          geminiError,
        );
      }
    }

    // 2. Niezawodna ścieżka awaryjna (Zero-Fail Heuristic Fallback)
    const turn = fen.split(" ")[1] === "w" ? "białych" : "czarnych";
    const turnEn = fen.split(" ")[1] === "w" ? "White" : "Black";

    const fallbackPl = `Analiza Arcymistrza: Ruch ${turn}. Kluczem w tej pozycji jest maksymalizacja aktywności figur i harmonijna kontrola pól centralnych. Skup się na osłabieniu obrony króla rywala.`;
    const fallbackEn = `Grandmaster Analysis: ${turnEn} to move. The key in this structure is maximizing piece activity and coordinating central squares. Target the weaknesses around the enemy king.`;

    const selectedText = lang === "pl" ? fallbackPl : fallbackEn;

    return NextResponse.json({
      source: "engine-heuristic",
      insight: selectedText,
      audioText: selectedText,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Wystąpił błąd podczas analizy pozycji." },
      { status: 500 },
    );
  }
}
