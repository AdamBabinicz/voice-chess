# Product Requirements Document (PRD): ChessTactics Audio Coach

## 1. Executive Summary

ChessTactics Audio Coach is a voice-first, accessible web application designed to help chess players improve calculation, positional understanding, and blindfold visualization. By combining the browser's native Web Speech API with an educational chess evaluation engine and a Minimax tactical responder, the app turns any phone, tablet, or laptop into an attentive, bilingual vocal chess tutor.

---

## 2. Target User Personas

### Persona A: Tomasz, Visually Impaired Chess Enthusiast

- Background: Tomasz has low vision and loves chess, but most online chess platforms rely heavily on visual cues, 2D drag-and-drop mechanics, and dense graphical user interfaces.
- Pain Points: Screen readers struggle with dynamic 2D canvas boards; moving pieces with a mouse or touch is frustrating.
- Needs: Voice input to speak moves, clear audio announcements of every opponent reply, and high-contrast, clutter-free presentation.

### Persona B: Maria, Aspiring Club Player (1400 FIDE)

- Background: Maria wants to reach 1800+ FIDE. Her coach told her that the fastest way to improve calculation is training blindfold chess.
- Pain Points: Training blindfold with books is tedious; playing against regular computer bots with a visible board tempts her to look, while weak bots blunder constantly.
- Needs: A Blindfold Mode that conceals the physical board, announces moves verbally, and a tactical bot powered by Minimax depth evaluation with positional piece-square tables.

### Persona C: Liam, Hands-Free / Audio Learner

- Background: Liam commutes, walks, or exercises and wants to solve chess puzzles and review game concepts without having to stare at a screen constantly.
- Needs: Continuous audio feedback, spoken notation, coach voice muting toggle when deep focus is needed, and one-tap voice interaction.

---

## 3. User Journey and Core Flow

1. Start Session: User opens the web application on mobile or desktop.
2. Mode Selection: User chooses between Standard Visible Board and Blindfold Mode, with optional coach audio muting.
3. Move Execution: User speaks their move (e.g. "e4" or "skoczek f3") or taps squares on the board with seamless piece switching.
4. Voice Parsing: Speech recognition transcribes speech and verifies legality in chess.js.
5. Coach Pedagogical Analysis: Audio coach engine evaluates position, piece harmony, and threats.
6. Audio Feedback: Browser announces coach insight aloud (if unmuted) and computer plays an evaluated reply move.
7. Continuous Loop: Player visualizes opponent reply, hears pedagogical evaluation, and continues the game.

---

## 4. Functional Requirements

### FR-01: Voice Recognition and Command Parsing

- The system must capture microphone input via the Web Speech API.
- It must parse spoken algebraic chess notation in both Polish and English.
- English examples: "e4", "knight to f3", "castle kingside", "bishop takes c6".
- Polish examples: "e cztery", "skoczek f3", "koń f3", "roszada", "długa roszada", "bicie na d5".
- In case of speech recognition failure or noisy surroundings, an accessible fallback input box with Enter submission must be immediately available.

### FR-02: Interactive 8x8 Board and Fluid Piece Selection

- The board must render an 8x8 grid with responsive scaling (no overflow, no square clipping).
- Classical international Staunton tournament vector symbols for white (#ffffff) and black (#27272a) pieces.
- High-contrast square colors (light squares #eef4e8, dark squares #a8c283).
- **Fluid Piece Reselection**: Tapping a different own piece immediately switches the active selection without requiring explicit deselection of the previously selected square.

### FR-03: Real-Time Audio Coach Engine & Mute Control

- Every legal move by the player and the opponent triggers pedagogical commentary:
  - Opening principles (center pawn occupancy, knight/bishop development, castling safety).
  - Tactical motifs (forks, pins, checks, checkmates, material captures).
  - Positional warnings (threats created by the opponent's reply).
- Spoken audio generated locally via browser `SpeechSynthesisUtterance`.
- **Coach Audio Mute Toggle**: Dedicated one-click mute/unmute action in the coach insight card and settings modal, silencing speech synthesis while retaining visual commentary text.
- Dedicated "Replay insight" button to re-listen to the coach's last instruction on demand.

### FR-04: Multi-Tier Bot Engine (Minimax & Alpha-Beta)

- **Beginner**: Accessible, natural play with randomized legal moves and basic capture opportunities.
- **Intermediate**: 1-2 ply tactical evaluator assessing material balance, center control, and piece development.
- **Master**: 3-ply Minimax search with Alpha-Beta pruning, Piece-Square Tables (PST) for positional value, king safety checks, and tactical fork prevention.

### FR-05: Blindfold Visualization Mode

- A toggle button enables Blindfold Mode, applying an opaque backdrop and blurring the board.
- The user visualizes the position solely through voice announcements.
- A "Peek board (3s)" button temporarily unhides the pieces for 3 seconds before automatically re-blurring, allowing verification without breaking mental discipline.

### FR-06: Curated Tactical Puzzles

- Foundational tactical categories available on the landing page:
  1. Knight Fork: Multi-piece simultaneous fork.
  2. Back Rank Mate: Exploitation of trapped king behind pawns.
  3. Absolute Pin: Diagonal piece pinning against the king.
  4. Rook Skewer: Linear x-ray attack winning major material.
  5. Discovered Attack: Unmasking attack line with check.
  6. Support Checkmate: Direct coordination strike on f7.
- Clicking any puzzle card immediately loads the FEN state onto the board, plays a coach briefing, and focuses the user on finding the winning move.

### FR-07: Settings and Customization

- Bilingual interface toggle: Polish (PL) and English (EN).
- Voice synthesis playback speed selector: 0.75x, 1.0x, 1.25x.
- Bot difficulty selector: Beginner, Intermediate, Master.
- Coach voice audio toggle: Enable / Mute speech synthesis.
- Voice mode toggle: Push-to-talk vs. Continuous listening.

---

## 5. Non-Functional Requirements (NFR)

- Performance: Voice transcription to chess move execution must complete in under 500ms; Minimax search depth 3 responds within 200ms.
- Accessibility (WCAG 2.1 AA): All interactive elements possess explicit aria-label attributes; contrast ratios exceed 4.5:1 in Light and Dark themes; full keyboard navigation.
- Privacy and Security: Zero voice audio is sent to remote servers; speech recognition is processed on-device. No telemetry or analytics tracking.
- Compatibility: Fully operational in Google Chrome, Microsoft Edge, Brave, and Safari on desktop and mobile.

---

## 6. Milestones and Delivery Status

- M1: Core Engine (chess.js integration, legal moves, board UI) - Completed.
- M2: Voice Architecture (Web Speech API integration, bilingual parser) - Completed.
- M3: Coach AI Engine (Real-time pedagogical speech heuristics) - Completed.
- M4: Blindfold Mode (Board shroud, 3s peek mechanism, audio replay) - Completed.
- M5: Tournament Refinements (Minimax search, coach mute control, fluid piece reselection) - Completed.
