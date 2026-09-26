# Technical Specification (Spec): ChessTactics Audio Coach

## 1. Architecture Overview

ChessTactics Audio Coach is built as a modular, client-side, voice-first web application leveraging modern React 19 and Next.js 16 (App Router). The system operates entirely within the user's browser, utilizing native Web APIs for speech recognition, text-to-speech synthesis, and client-side chess rule validation via chess.js.

---

## 2. Technology Stack

- Framework: Next.js 16 (App Router, Static and Client hybrid components).
- Core Library: React 19.
- Language: TypeScript 5.7 (Strict mode enabled).
- Styling: Tailwind CSS v4 (@tailwindcss/postcss).
- Icons: Lucide React.
- Chess Engine: chess.js (v1.4.0) for move generation, FEN handling, and legal state validation.
- Speech APIs: Native Browser Web Speech API (SpeechRecognition and SpeechSynthesis).
- Package Manager: pnpm (v9.15.4).

---

## 3. Directory and File Structure

- app/
  - globals.css: Tailwind CSS directives and color variables.
  - layout.tsx: SEO metadata, OpenGraph, JSON-LD structured data.
  - page.tsx: Main application orchestrator and game state manager.
- components/
  - chess-board-view.tsx: 8x8 interactive board grid with blindfold overlay.
  - chess-piece.tsx: High-fidelity SVG vectors for Staunton pieces.
  - legal-modal.tsx: Privacy policy and terms of service modal.
  - settings-modal.tsx: Language, speed, difficulty, and audio preferences.
  - voice-controller.tsx: Speech-to-text recognition and bilingual parser.
  - ui/button.tsx: Reusable accessible button component.
- lib/
  - chess-coach-engine.ts: Pedagogical evaluation engine and positional hints.
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

### 4.2. Pedagogical Audio Engine (lib/chess-coach-engine.ts)

- Pure, deterministic function: generateCoachInsight(game, lastMove, lang, isPlayerMove).
- Evaluates:
  - Checkmates and draws with end-game voice reflections.
  - Tactical checks and immediate king safety alerts.
  - Material captures (identifies captured piece type and square).
  - Castling status (kingside/queenside rook coordination).
  - Opening development metrics (central pawn occupation on e4/d4, knight placement before bishops).
  - Piece geometry (outposts for knights, open files for rooks, line control for queens).
- Returns bilingual text feedback formatted for display and vocal synthesis.

### 4.3. Interactive Board and Vector Rendering (components/chess-board-view.tsx and chess-piece.tsx)

- Renders an 8x8 grid without CSS inline-styles, using standard Tailwind classes (grid-cols-8 grid-rows-8).
- Uses exact SVG tournament Staunton silhouettes optimized for scalability:
  - White pieces: #FFFFFF fill with #18181b contour.
  - Black pieces: #27272a fill with #09090b contour.
  - Size constrained to h-[84%] w-[84%] to guarantee zero square-clipping.
- Supports Blindfold Mode via an absolute backdrop layer with mental visualization prompts and a 3-second preview timeout.

### 4.4. Audio Speech Output (app/page.tsx)

- Uses window.speechSynthesis.
- Configured with SpeechSynthesisUtterance:
  - lang: pl-PL for Polish, en-US for English.
  - rate: Dynamic speed multiplier (0.75, 1.0, 1.25).
- Audio context is explicitly resumed on user gestures to prevent browser autoplay blocking.

---

## 5. Data Flow Diagram

1. User Speech Input is captured by VoiceController.
2. VoiceController parses speech through parseSpokenMove and sends notation to applyMove.
3. Chess.js validates move legality:
   - If invalid: An audio error prompt is generated and spoken.
   - If valid: Board state and move history are updated.
4. Coach engine (generateCoachInsight) analyzes resulting position and returns pedagogical feedback.
5. SpeechSynthesisUtterance speaks the coach insight aloud.
6. Computer opponent generates a response move.
7. Coach engine analyzes the computer response and warns the player about new threats.

---

## 6. Build, Lint and Execution

- Development server: pnpm dev (runs Next.js with --webpack flag).
- Production build: pnpm build (optimizes static assets and bundles).
- Production start: pnpm start (serves the pre-rendered application on port 3000).
