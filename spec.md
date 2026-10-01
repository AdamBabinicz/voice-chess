# Technical Specification (Spec): ChessTactics Audio Coach
*System architecture, component decomposition, and technical implementation.*

*Companion documents: Product Requirements Document (PRD) and Project Scope. All component definitions, engine parameters, and testing criteria are aligned across the documentation suite.*

---

## 1. Architecture Overview

ChessTactics Audio Coach is engineered as a modular, client-side progressive web application built with **React 19** and **Next.js 16 (App Router)**. It features an event-driven audio synchronization pipeline, client-side chess state evaluation, an adaptive sub-50ms Minimax tactical responder, and a server-side Gemini API proxy utilizing grounded prompting for deep tactical assessments.

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
│   │(8x8 Grid/Blind)  │   │(TTS/Queue/Log)   │   │(WebSpeech/Typed) │   │
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
- **Chess Validation**: chess.js (v1.4.0)
- **Tactical Engine**: Deterministic 2-ply (+1 root) Minimax with Alpha-Beta pruning, MVV-LVA move ordering, and Piece-Square Tables (PST) (<50 ms execution)
- **Audio Synthesizer**: Native Web Audio API (procedural oscillator sound generation with self-healing context)
- **Speech Stack**: Browser Native Web Speech API (`SpeechRecognition` for Chromium-first voice capture; `SpeechSynthesis` with `localService` preference for on-device TTS)
- **AI Model**: Google Gemini API (`@google/genai`) via `/api/analyze` using grounded prompting

*Versions reflect the dependency manifest (`package.json`) pinned at delivery.*

---

## 3. Directory & Component Structure

```text
├── app/
│   ├── api/analyze/route.ts   # Server-side Gemini AI positional analysis (grounded prompt)
│   ├── globals.css            # Tailwind CSS theme variables
│   ├── layout.tsx             # SEO, OpenGraph, JSON-LD schema, Consent Mode v2
│   └── page.tsx               # Lean view orchestrator (~350 LOC)
├── components/
│   ├── chess-board-view.tsx   # Responsive 8x8 interactive board & blindfold overlay
│   ├── chess-piece.tsx        # High-contrast SVG Staunton-design piece vectors
│   ├── coach-panel.tsx        # Audio speech controls, moves log, material tally
│   ├── cookie-consent.tsx     # GDPR banner, persistent 🍪 FAB, Consent Mode v2 bridge
│   ├── legal-modal.tsx        # Privacy Policy & Terms of Service dialog
│   ├── settings-modal.tsx     # Voice speed, engine difficulty, mode toggles
│   ├── site-footer.tsx        # Accessible footer & legal triggers
│   ├── site-header.tsx        # Responsive navigation & quick game controls
│   ├── tactics-section.tsx    # Curated tactical puzzle cards (W3C role="group")
│   ├── voice-controller.tsx   # Speech-to-text recognition & phonetic typed fallback
│   └── ui/button.tsx          # Reusable accessible button primitive
└── lib/
    ├── audio-effects.ts       # Self-healing procedural WebAudio synthesizer
    ├── chess-coach-engine.ts  # Pedagogical heuristic engine & fast tactical responder
    ├── tactical-puzzles.ts    # Geometry-verified tactical positions with unique solutions
    ├── translations.ts        # Bilingual i18n dictionary (PL / EN)
    └── utils.ts               # Classnames utility (clsx / twMerge)
```

---

## 4. Module Specifications

### 4.1. Audio Speech & Natural Pacing Pipeline (`app/page.tsx` & `components/coach-panel.tsx`)

- **Natural Pacing Architecture**: Decouples player move registration from computer reply execution to avoid cognitive audio collision.
  - Acoustic move/capture effect plays immediately via procedural WebAudio.
  - Pedagogical insight is verbalized via `window.speechSynthesis`.
  - Opponent engine executes its <50ms calculation immediately, but delays board animation and move placement until `utterance.onend` fires.
  - Watchdog fallback (`botTimeoutRef` set to speech duration + 1500ms) ensures the game proceeds even if browser speech events are dropped by system audio interruptions.
- **Speech Synthesis Voice Resolution**: Prioritizes local on-device voices (`voice.localService === true`) to ensure offline voice output. When only remote voices exist (e.g. Chrome cloud voices), synthesis functions with network access.

### 4.2. Self-Healing Procedural WebAudio (`lib/audio-effects.ts`)

- Implements self-healing `getAudioContext()`:
  - Automatically handles suspended or interrupted `AudioContext` states upon user gesture.
  - Audio graph creation is wrapped in structured `try...catch` blocks to protect UI rendering threads from underlying audio hardware faults.
- Generates procedural audio timbres:
  - **Move**: 120Hz damped triangle wave burst (wood impact).
  - **Capture**: Dual-frequency square-sine transient (snappy physical collision).
  - **Check**: Two-tone harmonic alert chord.
  - **Victory / Draw**: Ascending or neutral harmonic arpeggios.

### 4.3. Bilingual Phonetic Voice & Typed Parser (`components/voice-controller.tsx`)

- **Browser Compatibility & Fallback Matrix**:
  - **Full Voice Support**: Google Chrome (Desktop/Android), Microsoft Edge via `webkitSpeechRecognition`. Chromium recognition streams audio to a cloud service and requires connectivity.
  - **Prefixed/Partial Support**: Safari 14.1+ (iOS/macOS).
  - **Typed-Input Fallback**: Mozilla Firefox and offline sessions utilize an accessible input field that feeds the exact same semantic parser.
- **Normalization Pipeline**:
  - Phonetic dictionary converts numbers („jeden”, „dwa”, „trzy” → 1, 2, 3), Polish and English letter names („ef”, „ce”, „gie” → f, c, g), and piece names („skoczek”, „koń”, „knight” → N; „wieża”, „rook” → R; „hetman”, „królowa”, „queen” → Q).
  - Castling parser: maps „roszada”, „krótka roszada”, „castle kingside” → `O-O`; „długa roszada”, „castle queenside” → `O-O-O`.
  - Disambiguation: Validates candidate SAN strings against `chess.js.moves()` to ensure strict rule compliance before mutating board state.

### 4.4. Fast Tactical Responder Engine (`lib/chess-coach-engine.ts`)

- **Search Depth**: Calibrated 2-ply (+1 root) depth. Deliberately capped to maintain sub-50ms turnaround and keep the main thread responsive.
- **Pruning & Ordering**:
  - Alpha-Beta window pruning minimizes explored subtree size.
  - **MVV-LVA Move Ordering**: Evaluates aggressive victim-attacker pairings first (e.g., P×Q evaluated before Q×P), triggering early alpha cutoffs.
- **Evaluation Function**:
  - Piece-Square Tables (PST) scoring center occupation, king safety, and open line development.
  - O(1) Mating Drive Heuristic: Mathematical king-cornering evaluation matrix that penalizes distance between winning pieces and the opposing king, accelerating endgame checkmate conversion.

### 4.5. Gemini Deep Positional Analysis Endpoint (`app/api/analyze/route.ts`)

- **Method**: POST
- **Request Payload**:

```typescript
interface AnalyzeRequest {
  fen: string;
  history: string[];
  lang: "pl" | "en";
  materialScore: number;
  tacticalFlags: {
    inCheck: boolean;
    hasFork: boolean;
    hasPin: boolean;
  };
  legalMoves: string[];
}
```

- **Grounded Prompting Architecture**:
  - Ground truth (evaluation scores, material balance, check status, legal moves) is computed by the local deterministic engine and passed directly to the model.
  - The system prompt instructs Gemini to act as a pedagogical Grandmaster explaining the strategic meaning of the supplied ground truth.
  - **Hallucination Mitigation**: The model is explicitly constrained from inventing move evaluations or suggesting illegal moves; all numerical references must match the provided payload.
- **Output Schema**: `{ insight: string, audioText: string }`
- **Error Handling Requirement**: A failed or malformed upstream response must degrade to a visible error/retry state in the UI — it must never be spoken aloud as if it were valid analysis.

---

## 5. Quality & Performance Verification

| Category | Standard | Score / Status | Method & Conditions |
| :--- | :--- | :--- | :--- |
| Mobile Performance | Google Lighthouse | 🟢 100 / 100 | Automated mobile preset; sub-second FCP and zero layout shifts |
| Lighthouse Accessibility | Google Lighthouse | 🟢 100 / 100 | Automated accessibility test suite (axe-core engine, user-impact weighting) |
| WCAG 2.1 AA Conformance | Manual Audit | 🟡 Scheduled (M9) | Pre-release manual audit: keyboard-only navigation & NVDA/VoiceOver screen reader verification |
| Best Practices | Google Lighthouse | 🟢 100 / 100 | Modern web standards, HTTPS-only secure origins; CSP-XSS audits informational |
| SEO & Discoverability | Google Lighthouse | 🟢 100 / 100 | Valid JSON-LD Schema.org (SoftwareApplication), OpenGraph, llms.txt (proposed spec) |
| Engine Turnaround Latency | Benchmark | 🟢 < 50 ms | 2-ply Alpha-Beta + MVV-LVA on mid-tier mobile hardware |
| Voice-to-Execution Latency | Field Sample | 🟢 ~180 ms median | Measured on Chrome Desktop via Wi-Fi (50-utterance sample); typed fallback < 50 ms. Deep Gemini analysis latency is network-bound (external API) and tracked separately |
| Privacy & GDPR Compliance | ePrivacy Directive | 🟢 Verified | Google Consent Mode v2 (default denied state: cookieless pings only; no cookies/identifiers written before explicit consent) |
| Offline Resilience | Web Standards | 🟢 Graceful Fallback | Local procedural WebAudio + local TTS voices operable offline; speech recognition degrades to typed fallback |

---

## 6. Implementation Notes & Security Guidelines

- **Inline Style Prohibition**: Strictly zero inline CSS (`style={{...}}`). All component layout, dynamic sizing, and responsive hiding must utilize utility classes from Tailwind CSS v4.
- **Server-Side API Key Protection**: `GEMINI_API_KEY` is strictly confined to the serverless runtime environment (`/api/analyze/route.ts`). No client-side bundle or network payload exposes API credentials.
- **Telemetry Transparency**: Consent state is initialized to `denied` across all ad and analytics storage flags in `app/layout.tsx`. Tag execution utilizes `afterInteractive` strategy to maintain high Core Web Vitals while transmitting non-identifying, cookieless measurement pings until the user consents via the persistent floating banner.
