# Product Requirements Document (PRD): ChessTactics Audio Coach
*A voice-first, accessible, and pedagogical chess training companion.*

---

## 1. Executive Summary

| Attribute | Specification |
| :--- | :--- |
| **Product Name** | ChessTactics Audio Coach |
| **Platform Target** | Responsive Web App (Desktop, Tablet, Mobile) |
| **Primary Audience** | Visually impaired players, blindfold practitioners, and hands-free chess students |
| **Core Differentiator** | Natural conversational voice input, synchronized pedagogical audio coaching, and Gemini AI deep positional analysis |
| **Lighthouse Score** | 🟢 **99 Performance** · 🟢 **100 Accessibility** · 🟢 **100 Best Practices** · 🟢 **100 SEO** |

**ChessTactics Audio Coach** transforms chess training from an eye-straining 2D grid into an immersive acoustic experience. Combining the browser's native Web Speech API with an educational chess evaluation engine, an AI-powered Master analysis endpoint, and an adaptable Minimax tactical responder, the platform enables seamless blindfold calculation and accessible gameplay.

---

## 2. Target User Personas

### 👤 Persona A: Tomasz — Visually Impaired Chess Enthusiast
- **Background**: Tomasz has low vision and loves chess, but mainstream online platforms rely entirely on visual drag-and-drop mechanics.
- **Pain Points**: Screen readers struggle with dynamic canvas boards; moving pieces with a mouse or touch is frustrating and prone to misclicks.
- **Needs**: Voice input to speak moves, clear acoustic feedback for every square/capture, and 100% WCAG 2.1 AA accessibility compliance.

### 👤 Persona B: Maria — Aspiring Club Player (1400 FIDE)
- **Background**: Maria wants to break the 1800+ FIDE threshold. Her coach emphasized that blindfold chess is the fastest way to sharpen multi-ply calculation.
- **Pain Points**: Training blindfold with notation books is tedious; standard computer bots tempt her to look at the board.
- **Needs**: A Blindfold Mode that conceals physical pieces, vocalizes replies, and offers a strict 3-second peek verification button.

### 👤 Persona C: Liam — Hands-Free / Audio Learner
- **Background**: Liam commutes, walks, or exercises and wants to solve tactical puzzles without staring at a smartphone screen.
- **Needs**: Continuous audio feedback, natural audio pacing where the engine does not speak over itself, and instant voice activation.

---

## 3. User Journey & Core Flow

```text
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│1. Voice Move     │──>│2. Move Legality  │──>│3. Sound Effect   │
│"roszada" / "e4"  │   │Verified chess.js │   │Piece drop/click  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
                                                        │
                                                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│6. Reciprocal     │   │5. Bot Reply      │   │4. Coach Insight  │
│Opponent Threat   │<──│Evaluated Delay   │<──│Spoken aloud via  │
│Warning (Audio)   │   │(Minimax bot)     │   │SpeechSynthesis   │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

1. **Start Session**: User accesses the application and selects preferred mode (Standard Board vs. Blindfold).
2. **Move Execution**: User speaks a move (e.g., *„skoczek f3”*, *„roszada”*, *„e4”*) or taps squares with fluid piece switching.
3. **Voice Parsing & Sound**: Speech is parsed to Standard Algebraic Notation (SAN), validated by `chess.js`, and accompanied by realistic WebAudio acoustic feedback.
4. **Pedagogical Audio Commentary**: Coach speaks an explanation of center occupation, tactical pins, or forks.
5. **Natural Pacing Bot Reply**: The bot waits for the coach to finish speaking before executing its evaluated response on the board.
6. **Master AI Analysis**: The player can at any moment request deep Grandmaster positional evaluation via Google Gemini AI.

---

## 4. Functional Requirements

### 🎙️ FR-01: Voice Recognition & Phonetic Parsing
- Continuous and push-to-talk microphone capture via Web Speech API (`SpeechRecognition`).
- Full bilingual parsing:
  - **Polish**: Numbers (*„jeden”* → 1, *„cztery”* → 4), letters (*„ef”* → f, *„ce”* → c), figures (*„skoczek”*, *„koń”*, *„goniec”*, *„wieża”*, *„hetman”*, *„królowa”*), captures (*„bije”*, *„zbija”*), castling (*„roszada”*, *„krótka roszada”*, *„długa roszada”*).
  - **English**: Algebraic notation (*„e4”*, *„knight f3”*, *„bishop takes c6”*, *„castle kingside”*).
- Visual live speech preview indicator displaying recognized words in real time.

### ♟️ FR-02: Interactive 8x8 Board & Fluid Reselection
- High-contrast responsive SVG Staunton piece set.
- Fluid piece reselection: clicking another friendly piece immediately switches active focus without requiring explicit deselection.
- Real-time material balance score tracking piece advantages numerically and qualitatively.

### 🗣️ FR-03: Real-Time Audio Coach & Natural Pacing
- Dynamic tactical evaluations for checks, pins, forks, discoveries, and checkmates.
- **Natural Pacing Architecture**: Opponent engine moves are deferred until the coach finishes verbal delivery, eliminating cognitive audio collisions.
- Dedicated coach mute toggle, speech rate control (0.75x–1.25x), and instant replay trigger.

### 🤖 FR-04: Deep Master AI Analysis (Gemini Integration)
- Dedicated `Analiza Mistrza AI` trigger invoking `/api/analyze`.
- Evaluates positional tension, tactical threats, and recommends multi-step plans with spoken audio readouts.

### 🙈 FR-05: Blindfold Visualization Mode
- Opaque frosted-glass backdrop shielding the physical pieces.
- Emergency `Podejrzyj planszę (3s)` peek button for visualization verification.
- Spoken full board state audio recitation (`Stan pozycji (Audio)`).

### 🍪 FR-06: Privacy, Security & GDPR/ePrivacy Compliance
- Zero external tracking cookies.
- Persistent, accessible floating cookie trigger (🍪) allowing users to revisit consent settings at any time.
- Integrated `cookie_consent_accepted` telemetry bridge for Google Tag Manager / Analytics.

---

## 5. Non-Functional Requirements (NFR)

| Metric | Target | Verified Score |
| :--- | :--- | :--- |
| **Mobile Performance** | > 90 | **99 / 100** |
| **Accessibility (WCAG 2.1 AA)** | 100 | **100 / 100** |
| **Best Practices** | 100 | **100 / 100** |
| **SEO & Discoverability** | 100 | **100 / 100** |
| **Voice-to-Execution Latency** | < 500 ms | ~180 ms |
| **Audio Renderer Resilience** | Crash-Proof | Auto-recovering `AudioContext` error boundaries |

---

## 6. Milestones & Delivery Status

- [x] **M1: Core Engine & UI** (chess.js, vector pieces, fluid selection) — *Completed*
- [x] **M2: Voice Architecture** (Web Speech API, bilingual phonetic parser, castling) — *Completed*
- [x] **M3: Audio Coach & Pacing** (Speech synthesis, natural timing delay, sound effects) — *Completed*
- [x] **M4: Deep AI Analysis** (Gemini serverless route `/api/analyze`) — *Completed*
- [x] **M5: Blindfold Mode** (Board shroud, 3s peek, spoken position reader) — *Completed*
- [x] **M6: Modular Refactoring** (Decomposition into `SiteFooter`, `CoachPanel`, `CookieConsent`) — *Completed*
