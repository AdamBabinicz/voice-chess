# Project Scope: ChessTactics Audio Coach

## 1. Project Overview & Vision

ChessTactics Audio Coach is a voice-first, accessible web application designed for interactive chess training, tactics mastery, and blindfold visualization. Users can speak their moves using natural language in Polish or English, receive instantaneous contextual positional commentary from an intelligent audio coach, and train their tactical vision either with an interactive board or in pure blindfold mode.

## 2. Core Problem & Value Proposition

- **Visualization Barrier**: Chess players struggle to train blindfold visualization without a partner calling out moves.
- **Accessibility Barrier**: Visually impaired and blind players face digital interfaces that are cluttered, highly visual, and unoptimized for voice feedback.
- **Boring Analysis**: Standard chess engines output raw numerical evaluations (e.g. `+0.7`) rather than human-like, pedagogical guidance.
- **Solution**: A distraction-free, voice-controlled chess interface where every move is parsed by speech recognition, explained in real-time by an audio coach, and played against an adaptable Minimax bot with full mute control.

## 3. In-Scope (MVP Implementation)

The following capabilities are fully designed, developed, and functional in the delivered product:

### 3.1. Voice Recognition & Natural Language Parsing

- Client-side Speech Recognition via standard browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`).
- Full bilingual voice parsing:
  - **Polish**: spoken numbers (_„e cztery”_ → `e4`), piece names (_„skoczek f3”_, _„goniec c4”_, _„wieża e1”_), castling (_„roszada”_, _„długa roszada”_).
  - **English**: algebraic notation (_„e4”_, _„knight f3”_, _„castle kingside”_).
- Fallback accessible text input with keyboard submission for noisy environments or browsers lacking microphone support.

### 3.2. Real-Time Audio Coach Engine & Mute Control

- Heuristic and geometric chess evaluation engine (`lib/chess-coach-engine.ts`) analyzing:
  - Center pawn control and line openings (e.g. `e4`, `d4`).
  - Piece development principles (knights before bishops, active outposts).
  - Immediate tactical threats, captures, checks, and mates.
  - Castling safety and rook activation.
- Real-time speech synthesis (`SpeechSynthesisUtterance`) with adjustable speed (0.75x, 1x, 1.25x) and immediate audio replay button.
- **Instant Mute/Unmute**: Coach voice toggle directly in the insight card header and settings modal for silent play while preserving textual advice.

### 3.3. Chess Board & Fluid Piece Interaction

- Strict 8x8 vector-rendered responsive board with classical Staunton international standard icons.
- Zero-clipping geometry and high-contrast color scheme for maximum visibility.
- **Fluid Reselection**: Direct reselection when clicking another piece without having to manually deselect the prior square.
- **Blindfold Mode**: One-tap board shroud with backdrop blur that conceals the pieces to force mental visualization, coupled with an emergency 3-second peek function.

### 3.4. Multi-Level Engine Opponent (Minimax with Alpha-Beta)

- **Beginner**: Randomized legal moves with occasional direct captures.
- **Intermediate**: Heuristic scoring evaluating material balance and active center occupation.
- **Master**: 3-ply Minimax algorithm with Alpha-Beta pruning and Piece-Square Tables (PST) for positional play.

### 3.5. Tactical Puzzles & Training

- Curated tactical positions demonstrating fundamental patterns:
  - **Knight Fork**: Multi-piece threat pattern.
  - **Back Rank Mate**: Trapped king weakness exploitation.
  - **Absolute Pin**: Diagonal piece pinning against the king.
  - **Rook Skewer**: Linear x-ray attack winning major material.
  - **Discovered Attack**: Check uncovering queen attack.
  - **Support Checkmate**: Direct coordination attack on f7.
- Instant loading into the main interactive board accompanied by coach audio prompts.

### 3.6. Accessibility & Responsive Design

- Mobile-first responsive layout (smartphones, tablets, desktop).
- High-contrast Light and Dark mode synced with system preferences and toggleable in UI.
- Modal dialogues for user settings and privacy/legal transparency.
- WCAG 2.1 compliance (keyboard navigable, screen-reader semantic HTML, aria-labels on all squares and interactive triggers).

---

## 4. Out-of-Scope (Deliberately Excluded for MVP Focus)

To ensure production stability, high performance, and focused user experience during the hackathon, the following items are intentionally omitted from this initial phase:

- **Server-side database storage & user accounts**: All state is maintained locally in the browser runtime without requiring user sign-in or tracking cookies.
- **Heavy Cloud Stockfish WASM**: Avoided multi-megabyte engine downloads to ensure instant sub-second loading on low-bandwidth mobile connections; replaced with a fast, deterministic client-side Minimax/PST heuristic engine.
- **Multiplayer WebSockets**: Focused strictly on personal 1-on-1 pedagogical training and solo visualization practice rather than online PvP matchmaking.
- **Paid voice API subscriptions**: Avoided proprietary paid TTS services (e.g. ElevenLabs API keys) to keep the app 100% free, privacy-first, and zero-configuration for hackathon reviewers.

---

## 5. Success Metrics for Hackathon Evaluation

1. **End-to-End Reliability**: Reviewers can open the app, speak or type a move, and receive vocal coaching in < 1 second.
2. **True Accessibility**: A user can play through a tactical sequence with their eyes closed solely relying on audio instructions and voice input.
3. **Clean Code & Zero Technical Debt**: Modular Next.js 16 App Router architecture, zero inline styles, fully typed TypeScript, and complete compliance with Devpost hackathon submission guidelines.
