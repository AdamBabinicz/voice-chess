# Project Scope: ChessTactics Audio Coach

## 1. Project Overview & Vision

ChessTactics Audio Coach is a voice-first, accessible web application engineered for interactive chess training, tactical pattern recognition, and blindfold visualization. Users can speak their moves using natural language in Polish or English (Chromium-first support matrix, see 3.1) or submit moves via an accessible typed fallback sharing the exact same semantic parsing pipeline. The system provides instantaneous acoustic feedback, contextual pedagogical audio commentary from an on-device coach, rapid tactical responses (<50 ms) from a local Minimax engine, and deep positional Grandmaster evaluation powered by Google Gemini AI.

*Companion document: Product Requirements Document (PRD): ChessTactics Audio Coach (feature requirements FR-01–FR-08, NFR table, milestones M1–M9, risk register). Terminology is aligned across both documents.*

---

## 2. Core Problem & Value Proposition

- **Visualization Barrier**: Chess players struggle to train blindfold visualization without an experienced partner calling out notation and verifying legal moves.
- **Accessibility Barrier**: Visually impaired and blind players face digital interfaces dominated by visually cluttered 2D canvas boards unoptimized for screen readers and hands-free interaction.
- **Boring & Opaque Analysis**: Standard chess engines output raw numerical scores (e.g. `+0.7`) rather than human-like, pedagogical guidance that explains the tactical "why".
- **Solution**: A distraction-free, voice-controlled chess interface where every move is parsed by speech recognition or keyboard fallback, explained in real-time by an audio coach, and played against an agile tactical responder bot with full mute and speed control.

---

## 3. In-Scope (Implemented & Functional Capabilities)

The following capabilities are fully designed, developed, and functional in the delivered product:

### 3.1. Voice Recognition & Natural Language Parsing (Chromium-First with Universal Fallback)

- Client-side Speech Recognition via standard browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`):
  - **Full Support**: Google Chrome (Desktop/Android), Microsoft Edge. Other Chromium-based browsers (e.g. Opera) generally inherit Chromium support but are outside the verified test matrix.
  - **Partial/Prefixed Support**: Safari 14.1+ (iOS/macOS) with WebKit prefixes.
  - **Fallback Mode**: Mozilla Firefox and offline environments automatically route input through the accessible typed-move input bar.
- Full bilingual voice and text parsing:
  - **Polish**: spoken numbers (*„e cztery”* → `e4`), piece names (*„skoczek f3”*, *„koń c3”*, *„goniec c4”*, *„wieża e1”*, *„hetman d1”*, *„królowa d1”*), captures (*„bije”*, *„zbija”*), castling (*„roszada”*, *„krótka roszada”*, *„długa roszada”*).
  - **English**: algebraic notation (*„e4”*, *„knight f3”*, *„bishop takes c6”*, *„castle kingside”*, *„castle queenside”*).
- **Universal Input Pipeline**: The typed input and voice recognition share the exact same phonetic normalization and `chess.js` legal validation pipeline, ensuring full feature parity across browser engines by construction.

### 3.2. Real-Time Audio Coach Engine & Natural Pacing

- Heuristic and geometric chess evaluation engine (`lib/chess-coach-engine.ts`) analyzing:
  - Center pawn control and line openings (e.g. `e4`, `d4`).
  - Piece development principles (knights before bishops, active outposts).
  - Immediate tactical threats, captures, pins, forks, and discovered checks.
  - King safety, castling timing, and rook activation on open files.
- Real-time speech synthesis (`SpeechSynthesisUtterance`) with adjustable speed (0.75x, 1x, 1.25x) and immediate audio replay trigger. Offline behavior is voice-dependent: locally installed system voices work 100% offline, while cloud-provided browser voices (e.g. Chrome's remote Google voices) require connectivity — the coach prefers locally installed voices where available.
- **Natural Pacing Architecture**: Opponent bot replies are queued and deferred until the coach finishes verbal delivery, preventing overlapping speech and sound effects.
- **Instant Mute/Unmute**: Coach voice toggle directly in the insight card header and settings modal for silent play while preserving textual advice.

### 3.3. Chess Board & Fluid Piece Interaction

- Responsive 8x8 vector-rendered board with classical Staunton-design SVG piece vectors.
- Zero-clipping geometry and high-contrast color scheme for maximum visibility.
- **Fluid Reselection**: Direct reselection when clicking another piece without having to manually deselect the prior square.
- **Blindfold Mode**: One-tap board shroud with backdrop blur that conceals the pieces to force mental visualization, coupled with an emergency 3-second peek function.
- **Spoken Position State**: Dedicated audio trigger reciting piece coordinates for complete blindfold situational awareness.

### 3.4. Multi-Level Engine Opponent (Fast Tactical Responder)

- **Beginner**: Randomized legal moves with occasional direct captures.
- **Intermediate**: Heuristic scoring evaluating material balance and active center occupation.
- **Tactical Responder (formerly Master Bot)**:
  - Calibrated 2-ply (+1 root) Minimax algorithm with Alpha-Beta pruning and Piece-Square Tables (PST).
  - **MVV-LVA Move Ordering**: Most Valuable Victim – Least Valuable Aggressor sorting to maximize pruning efficiency.
  - **Sub-50ms Turnaround**: Engineered specifically to prevent main-thread UI lag and browser stutter.
  - **O(1) Mating Drive Heuristic**: Mathematical king-cornering evaluation that accelerates endgame mating patterns.
  - *Architectural Note*: Positioned explicitly as a fast tactical responder rather than a FIDE-rated positional engine. Deep positional evaluation is delegated to the Gemini endpoint.

### 3.5. Curated Tactical Puzzles & Scripted Geometry Audit

- Curated tactical positions demonstrating fundamental patterns:
  - **Knight Fork (Widełki)**: Multi-piece simultaneous threat pattern.
  - **Back Rank Mate (Korytarz)**: Trapped king weakness exploitation on the 1st/8th rank.
  - **Absolute Pin (Związanie)**: Linear piece pinning against the king.
  - **Rook Skewer (Szpila)**: Linear attack driving away the more valuable piece.
  - **Discovered Attack (Atak z odsłony)**: Check uncovering a simultaneous queen attack.
  - **Deflection / Overloaded Defender (Odciągnięcie obrońcy)**: Geometry-verified FEN where `1. Qe7!` forces deflection leading to `2. Rxd8#`.
- Accessible multi-filter selector built with W3C-compliant `role="group"` and `aria-pressed` states.
- Automated per-theme FEN verification script ensuring unique solutions, correct turn indicators, and thematic validity.

### 3.6. Deep AI Positional Analysis (Google Gemini Integration)

- Dedicated server-side route `/api/analyze` communicating with Google Gemini API (`@google/genai`).
- **Grounded Prompting Architecture**: Payload passes current FEN, numerical material score, tactical flags (checks/pins/forks), and legal moves. The model generates human-like pedagogical plans grounded in supplied facts, substantially reducing hallucination risk; numeric evaluations originate strictly from the local engine, never from the LLM.
- Public agent discovery enabled via `/llms.txt` adhering to the proposed llmstxt.org specification.

### 3.7. Accessibility & Privacy Compliance

- **Automated Accessibility**: 100/100 Lighthouse Accessibility score, valid ARIA landmark structure, keyboard focus management, zero inline styles.
- **Manual Accessibility Roadmap**: Scheduled manual testing with screen readers (NVDA, VoiceOver) and keyboard-only navigation before official release (Milestone M9).
- **Privacy & Telemetry**:
  - No tracking cookies written without explicit user consent.
  - Integrated **Google Consent Mode v2** (advanced setup, default `denied` state): transmits cookieless measurement pings without setting identifiers or writing cookies until the user opts in. Disclosed explicitly: consent-denied mode means *no cookies and no user-identifying identifiers*, not *zero network requests*.
  - Persistent, accessible floating cookie trigger (🍪) allowing users to revisit consent settings at any time.

---

## 4. Out-of-Scope (Deliberately Excluded for MVP Focus)

To ensure production stability, high performance, and focused user experience during the hackathon, the following items are intentionally omitted from this initial phase:

- **Server-side database storage & user accounts**: All state is maintained locally in the browser runtime without requiring user sign-in or tracking cookies.
- **Embedded Stockfish (WASM) engine**: Avoided the multi-megabyte client-side engine download to ensure instant sub-second loading on low-bandwidth mobile connections; replaced with a fast, deterministic client-side Minimax/PST heuristic engine (<50 ms).
- **Multiplayer WebSockets**: Focused strictly on personal 1-on-1 pedagogical training and solo visualization practice rather than online PvP matchmaking.
- **Proprietary Paid Voice API Subscriptions**: Avoided proprietary paid TTS services (e.g. ElevenLabs API keys) to keep the app 100% free, privacy-first, and zero-configuration for hackathon reviewers, leveraging native browser `SpeechSynthesis`.

---

## 5. Success Metrics for Hackathon Evaluation

1. **End-to-End Reliability**: Reviewers can open the app in any supported browser (Chrome/Edge: voice or typed input; Safari 14.1+: typed or prefixed voice; Firefox/offline: typed input), submit a move, and hear the coach's vocal acknowledgement in < 1 second.
2. **Sub-50ms Bot Turnaround**: Computer move calculation completes in < 50 ms without dropping UI frames or locking audio playback.
3. **True Accessibility**: A user can navigate and play through tactical positions using keyboard-only controls or voice commands with clear acoustic feedback.
4. **Honest & Robust Engineering**: Zero claims of infallible perfection; transparent browser support matrix, grounded AI prompting, and full disclosure of cookieless telemetry under Consent Mode v2.
