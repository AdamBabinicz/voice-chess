# Technical Specification (Spec): ChessTactics Audio Coach
*System architecture, component decomposition, and technical implementation.*

---

## 1. Architecture Overview

ChessTactics Audio Coach is engineered as a modular, client-side progressive web application built with **React 19** and **Next.js 16 (App Router)**. It features an event-driven audio synchronization pipeline, client-side chess state evaluation, an adaptive Minimax tactical engine, and a server-side Gemini API proxy for deep tactical assessments.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App Router                          │
│                                                                        │
│   ┌───────────────────────── app/page.tsx ─────────────────────────┐   │
│   │                      (Main Orchestrator)                       │   │
│   └─────────┬──────────────────────┬──────────────────────┬────────┘   │
│             │                      │                      │            │
│             ▼                      ▼                      ▼            │
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│   │ChessBoardView    │   │CoachPanel        │   │VoiceController   │   │
│   │(8x8 Grid/Blind)  │   │(TTS/History)     │   │(WebSpeech API)   │   │
│   └──────────────────┘   └──────────────────┘   └──────────────────┘   │
│             │                      │                      │            │
│             ▼                      ▼                      ▼            │
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│   │audio-effects     │   │chess-coach-engine│   │/api/analyze      │   │
│   │(WebAudio Synth)  │   │(Minimax / PST)   │   │(Google Gemini)   │   │
│   └──────────────────┘   └──────────────────┘   └──────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router, Node.js runtime)
- **Library**: React 19 (Hooks, functional composition)
- **Language**: TypeScript 5.7 (Strict type checking)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Icons**: Lucide React
- **Chess Validation**: `chess.js` (v1.4.0)
- **Tactical Engine**: Deterministic Minimax with Alpha-Beta pruning & Piece-Square Tables (PST)
- **Audio Synthesizer**: Native Web Audio API (procedural oscillator sound generation)
- **Speech Stack**: Browser Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **AI Model**: Google Gemini API (`@google/genai`) via `/api/analyze`

---

## 3. Directory & Component Structure

```text
├── app/
│   ├── api/analyze/route.ts   # Server-side Gemini AI positional analysis
│   ├── globals.css            # Tailwind CSS theme variables
│   ├── layout.tsx             # SEO, OpenGraph, JSON-LD schema
│   └── page.tsx               # Lean view orchestrator (~350 LOC)
├── components/
│   ├── chess-board-view.tsx   # 8x8 interactive board & blindfold overlay
│   ├── chess-piece.tsx        # Tournament-standard SVG Staunton vectors
│   ├── coach-panel.tsx        # Audio speech controls, moves log, material tally
│   ├── cookie-consent.tsx     # GDPR banner, persistent 🍪 FAB, scroll-to-top
│   ├── legal-modal.tsx        # Privacy Policy & Terms of Service dialog
│   ├── settings-modal.tsx     # Voice speed, engine difficulty, mode toggles
│   ├── site-footer.tsx        # Accessible footer & legal triggers
│   ├── site-header.tsx        # Responsive navigation & quick game controls
│   ├── tactics-section.tsx    # Curated tactical puzzle cards
│   ├── voice-controller.tsx   # Speech-to-text recognition & phonetic parser
│   └── ui/button.tsx          # Reusable accessible button primitive
└── lib/
    ├── audio-effects.ts       # Crash-proof procedural WebAudio synthesizer
    ├── chess-coach-engine.ts  # Pedagogical heuristic engine & Minimax bot
    ├── translations.ts        # Bilingual i18n dictionary (PL / EN)
    └── utils.ts               # Classnames utility (clsx / twMerge)
```

---

## 4. Module Specifications

### 4.1. Audio Speech & Natural Pacing Pipeline (`app/page.tsx` & `components/coach-panel.tsx`)
- **Natural Pacing Architecture**: Decouples player move registration from computer reply execution. When the player executes a move:
  1. Acoustic piece drop effect plays immediately via procedural WebAudio.
  2. Pedagogical insight is verbalized via `window.speechSynthesis`.
  3. Opponent engine calculates response but waits for `utterance.onend` before physically placing its move.
  4. Watchdog fallback (`botTimeoutRef`) ensures play progresses even if audio hardware fails.

### 4.2. Crash-Proof Procedural WebAudio (`lib/audio-effects.ts`)
- Implements self-healing `getAudioContext()`:
  - Automatically resets stale or suspended `AudioContext` instances.
  - Wraps audio node graphs in `try...catch` boundaries, isolating renderer hardware failures from the UI thread.
  - Generates custom procedural timbres (wooden move thuds, dual-oscillator captures, harmonic check chords, victory arpeggios).

### 4.3. Bilingual Phonetic Voice Parser (`components/voice-controller.tsx`)
- Interfaces with `webkitSpeechRecognition` / `SpeechRecognition`.
- Normalizes spoken vocabulary:
  - Spoken numbers (`"raz"`, `"dwa"`, `"trzy"` → 1, 2, 3).
  - Spoken letters (`"ef"`, `"gie"`, `"ce"` → f, g, c).
  - Spoken pieces (`"skoczek"`, `"koń"`, `"knight"` → N; `"hetman"`, `"królowa"` → Q).
  - Castling commands: `"roszada"`, `"krótka roszada"`, `"0-0"` → `O-O`; `"długa roszada"` → `O-O-O`.

### 4.4. Gemini Deep Analysis Endpoint (`app/api/analyze/route.ts`)
- **Method**: `POST`
- **Payload**: `{ fen: string, history: string[], lang: "pl" | "en" }`
- **Output**: `{ insight: string, audioText: string }`
- **Behavior**: Evaluates structural imbalances, open files, and tactical combinations, returning concise pedagogical advice for speech synthesis.

---

## 5. Quality & Performance Verification

| Category | Standard | Score / Status |
| :--- | :--- | :--- |
| **Mobile Lighthouse** | Google PSI | 🟢 **99 / 100** |
| **Accessibility** | WCAG 2.1 AA | 🟢 **100 / 100** |
| **Best Practices** | Modern Web Standards | 🟢 **100 / 100** |
| **SEO** | Schema.org Structured Data | 🟢 **100 / 100** |
| **GDPR Compliance** | ePrivacy Directive | Verified (Persistent 🍪 FAB + Consent Mode) |
