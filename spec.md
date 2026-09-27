# Technical Specification (Spec): ChessTactics Audio Coach

## 1. Architecture Overview

ChessTactics Audio Coach is built as a modular, client-side, voice-first web application leveraging modern React 19 and Next.js 16 (App Router). The system operates entirely within the user's browser, utilizing native Web APIs for speech recognition, text-to-speech synthesis, client-side chess rule validation via chess.js, and an integrated Minimax engine with Alpha-Beta pruning for opponent responses.

---

## 2. Technology Stack

- Framework: Next.js 16 (App Router, Static and Client hybrid components).
- Core Library: React 19.
- Language: TypeScript 5.7 (Strict mode enabled).
- Styling: Tailwind CSS v4 (@tailwindcss/postcss).
- Icons: Lucide React.
- Chess Engine: chess.js (v1.4.0) for move generation, FEN handling, and legal state validation.
- Opponent Engine: Client-side Minimax with Alpha-Beta pruning and Piece-Square Tables (PST).
- Speech APIs: Native Browser Web Speech API (SpeechRecognition and SpeechSynthesis).
- Package Manager: pnpm (v9.15.4).

---

## 3. Directory and File Structure

- app/
  - globals.css: Tailwind CSS directives and color variables.
  - layout.tsx: SEO metadata, OpenGraph, JSON-LD structured data.
  - page.tsx: Main application orchestrator, board state manager, and audio controller.
- components/
  - chess-board-view.tsx: 8x8 interactive board grid with blindfold overlay and coordinate labels.
  - chess-piece.tsx: High-fidelity SVG vectors for Staunton pieces.
  - legal-modal.tsx: Privacy policy and terms of service modal.
  - settings-modal.tsx: Language, speed, difficulty, coach voice mute, and input preferences.
  - site-header.tsx: Semantic top navigation bar with quick game controls.
  - tactics-section.tsx: Interactive showcase of curated tactical puzzles.
  - voice-controller.tsx: Speech-to-text recognition and bilingual parser.
  - ui/button.tsx: Reusable accessible button component.
- lib/
  - chess-coach-engine.ts: Pedagogical evaluation engine, Minimax opponent engine (`findBestEngineMove`), and tactical puzzles.
  - audio-effects.ts: Synthesized web audio effects (moves, captures, checks, victory, illegal errors).
  - translations.ts: Bilingual i18n dictionary (Polish / English).
  - utils.ts: Tailwind class merging (clsx and twMerge).
- scope.md: Hackathon scope definition.
- prd.md: Product requirements document.
- spec.md: This technical specification.
- package.json: Dependencies, scripts, and package manager config.
- tsconfig.json: TypeScript configuration.

---

## 4. Module Specifications

### 4.1. Speech Input and Natural Language Parsing (components/voice-controller.tsx)

- Interfaces with window.webkitSpeechRecognition or window.SpeechRecognition.
- Normalizes spoken user phrases into valid Standard Algebraic Notation (SAN):
  - Converts Polish number words (jeden -> 1, dwa -> 2 ... osiem -> 8).
  - Maps phonetic piece names to standard notation (skoczek, koń, knight -> N; goniec, bishop -> B; wieża, rook -> R; hetman, królowa, queen -> Q; król, king -> K).
  - Recognizes castling commands: roszada -> O-O, długa roszada -> O-O-O.
- Provides fallback input for manual move typing with Enter key support.

### 4.2. Pedagogical Audio Engine & Minimax Bot (lib/chess-coach-engine.ts)

- **Pedagogical Feedback**: `generateCoachInsight(game, lastMove, lang, isPlayerMove)`.
  - Evaluates checkmates, stalemates, checks, material captures, castling, opening center control, and piece geometry.
  - Returns bilingual text feedback formatted for display and vocal synthesis.
- **Engine Opponent**: `findBestEngineMove(game, difficulty)`.
  - `beginner`: Random legal move selection with optional capture weighting.
  - `intermediate`: 1-2 ply heuristic evaluating material and center square control.
  - `master`: 3-ply Minimax search with Alpha-Beta pruning, move ordering (captures and checks first), and Piece-Square Tables (PST) evaluating square values for pawns, knights, and bishops.

### 4.3. Interactive Board & Fluid Selection (components/chess-board-view.tsx & app/page.tsx)

- Renders an 8x8 grid without CSS inline-styles, using Tailwind classes (`grid-cols-8 grid-rows-8`).
- Uses exact SVG tournament Staunton silhouettes optimized for scalability:
  - White pieces: #FFFFFF fill with #18181b contour.
  - Black pieces: #27272a fill with #09090b contour.
  - Size constrained to h-[84%] w-[84%] to guarantee zero square-clipping.
- **Fluid Reselection**: Clicking an alternative own piece immediately updates `selectedSquare` to that piece without requiring prior deselection.
- Supports Blindfold Mode via an absolute backdrop layer with mental visualization prompts and a 3-second preview timeout.

### 4.4. Audio Speech Output & Mute Control (app/page.tsx)

- Uses native `window.speechSynthesis`.
- Configured with `SpeechSynthesisUtterance`:
  - `lang`: `pl-PL` for Polish, `en-US` for English.
  - `rate`: Dynamic speed multiplier (0.75, 1.0, 1.25).
- **Mute Toggle**: `coachMuted` state suppresses voice output while keeping textual insights active on the UI.
- Audio context is explicitly resumed on user gestures to prevent browser autoplay blocking.

---

## 5. Data Flow Diagram

1. User Input: Player speaks move via microphone or taps two board squares (with instant piece switching).
2. Verification: Chess.js validates move legality:
   - If invalid: `playIllegalSound()` triggers with visual warning.
   - If valid: Move executes, updating board state, move history, and material balance.
3. Coach Analysis: `generateCoachInsight` calculates positional context and speaks insight aloud (unless muted).
4. Opponent Response: `findBestEngineMove` executes according to chosen difficulty (`beginner`, `intermediate`, or `master` via Minimax/Alpha-Beta).
5. Opponent Feedback: Opponent move executes on board, with reciprocal coach threat analysis.

---

## 6. Build, Lint and Execution

- Development server: pnpm dev (runs Next.js with --webpack flag).
- Production build: pnpm build (optimizes static assets and bundles).
- Production start: pnpm start (serves the pre-rendered application on port 3000).
