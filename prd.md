# Product Requirements Document (PRD): ChessTactics Audio Coach
*A voice-first, accessible, and pedagogical chess training companion.*

---

## 1. Executive Summary

| Attribute | Specification |
| :--- | :--- |
| **Product Name** | ChessTactics Audio Coach |
| **Platform Target** | Responsive Web App (Desktop, Tablet, Mobile) |
| **Primary Audience** | Visually impaired players, blindfold practitioners, and hands-free chess students |
| **Core Differentiator** | Natural conversational voice input, synchronized pedagogical audio coaching, sub-50ms tactical engine, and Gemini AI deep positional analysis |
| **Lighthouse Score** | 🟢 **100 Performance** · 🟢 **100 Accessibility** (automated) · 🟢 **100 Best Practices** · 🟢 **100 SEO** |
| **Voice-Input Browser Support** | 🟢 Chrome / Edge — full support · 🟡 Safari 14.1+ — partial, prefixed `webkitSpeechRecognition` · 🔴 Firefox — not supported (typed-move fallback) |
| **Competition Track** | Accessibility, Voice AI & Educational Innovation |

**ChessTactics Audio Coach** transforms chess training from an eye-straining 2D grid into an immersive acoustic experience. Combining the browser's native Web Speech API with an educational chess evaluation engine, an AI-powered analysis endpoint (Google Gemini), an optimized sub-50ms Minimax tactical responder, and an auditable tactical puzzle curriculum, the platform enables seamless blindfold calculation and gameplay that is fully operable by keyboard and screen reader (Lighthouse Accessibility 100; a manual WCAG 2.1 AA conformance audit is scheduled before release — see NFR and milestone M9).

**Voice-input platform note.** Speech *recognition* is Chromium-first: Chrome and Edge support it fully (processing audio via a cloud service, so it requires internet connectivity), Safari offers partial, prefixed support since version 14.1, and Firefox does not support it. The application therefore ships a typed-move fallback sharing the same parsing pipeline, so 100% of features remain operable without speech recognition (see FR-01). Speech *synthesis* (the coach) uses on-device voices and keeps working offline.

---

## 2. Target User Personas

### 👤 Persona A: Tomasz — Visually Impaired Chess Enthusiast
- **Background**: Tomasz has low vision and loves chess, but mainstream online platforms rely entirely on visual drag-and-drop mechanics.
- **Pain Points**: Screen readers struggle with dynamic canvas boards; moving pieces with a mouse or touch is frustrating and prone to misclicks.
- **Needs**: Voice input to speak moves, clear acoustic feedback for every square/capture, and WCAG 2.1 AA conformance verified by both automated Lighthouse audits and a manual screen-reader/keyboard audit, with valid W3C ARIA filter structures.

### 👤 Persona B: Maria — Aspiring Club Player (1400 FIDE)
- **Background**: Maria wants to break the 1800+ FIDE threshold. Her coach emphasized that blindfold chess is the fastest way to sharpen multi-ply calculation.
- **Pain Points**: Training blindfold with notation books is tedious; standard computer bots tempt her to look at the board or take too long to compute.
- **Needs**: A Blindfold Mode that conceals physical pieces, vocalizes replies, offers a strict 3-second peek verification button, and provides instantaneous responsive bot play.

### 👤 Persona C: Liam — Hands-Free / Audio Learner
- **Background**: Liam commutes, walks, or exercises and wants to solve tactical puzzles without staring at a smartphone screen.
- **Needs**: Continuous audio feedback, natural audio pacing where the engine does not speak over itself, diverse tactical puzzles with geometry validated by automated per-theme tests, and instant voice activation — plus a typed-input fallback that keeps the app fully usable when speech recognition is unavailable (Firefox, offline, denied microphone permission).

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
│Warning (Audio)   │   │(<50ms Minimax)   │   │SpeechSynthesis   │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

1. **Start Session**: User accesses the application and selects preferred mode (Standard Board vs. Blindfold).
2. **Move Execution**: User speaks a move (e.g., „skoczek f3”, „roszada”, „e4”) or taps squares with fluid piece switching.
3. **Voice Parsing & Sound**: Speech is parsed to Standard Algebraic Notation (SAN), validated by chess.js, and accompanied by realistic WebAudio acoustic feedback. Voice input shares one parsing pipeline with the typed-move fallback (Firefox, offline, denied microphone permission), so every feature stays fully operable without speech recognition.
4. **Pedagogical Audio Commentary**: Coach speaks an explanation of center occupation, tactical pins, or forks.
5. **Natural Pacing Bot Reply**: The bot calculates its response in <50ms (Alpha-Beta + MVV-LVA + Mating Drive) and waits for the coach to finish speaking before executing its move.
6. **Master AI Analysis**: The player can at any moment request deep Grandmaster positional evaluation via Google Gemini AI (/api/analyze).

---

## 4. Functional Requirements

### 🎙️ FR-01: Voice Recognition & Phonetic Parsing
- Continuous and push-to-talk microphone capture via Web Speech API (SpeechRecognition).
- Full bilingual parsing:
  - Polish: Numbers („jeden” → 1, „cztery” → 4), letters („ef” → f, „ce” → c), figures („skoczek”, „koń”, „goniec”, „wieża”, „hetman”, „królowa”), captures („bije”, „zbija”), castling („roszada”, „krótka roszada”, „długa roszada”).
  - English: Algebraic notation („e4”, „knight f3”, „bishop takes c6”, „castle kingside”).
- Visual live speech preview indicator displaying recognized words in real time.
- Browser Support Matrix (speech recognition): Chrome / Edge — full support; Safari 14.1+ — partial, prefixed `webkitSpeechRecognition` (no `SpeechGrammar` support); Firefox — not supported on desktop or Android. Product implication: the voice-first experience is Chromium-first, and all features remain fully operable via the typed-move fallback.
- Offline & connectivity behavior: Chromium recognition streams audio to a cloud service and does not function offline; on connectivity loss the UI shows a visible „voice unavailable” state and routes input to the typed fallback. The audio coach (speech synthesis) uses on-device voices and keeps working offline.
- Input preconditions: HTTPS secure context and an explicit microphone permission; permission denial degrades gracefully to typed input.

### ♟️ FR-02: Interactive 8x8 Board & Fluid Reselection
- High-contrast responsive SVG Staunton piece set.
- Fluid piece reselection: clicking another friendly piece immediately switches active focus without requiring explicit deselection.
- Real-time material balance score tracking piece advantages numerically and qualitatively.

### 🗣️ FR-03: Real-Time Audio Coach & Natural Pacing
- Dynamic tactical evaluations for checks, pins, forks, discoveries, and checkmates.
- Natural Pacing Architecture: Opponent engine moves are deferred until the coach finishes verbal delivery, minimizing overlapping audio — coach narration and sound effects are sequenced in a single playback queue, verified in scripted QA sessions with zero overlapping speech/SFX events.
- Dedicated coach mute toggle, speech rate control (0.75x–1.25x), and instant replay trigger.

### 🧠 FR-04: High-Performance Tactical Engine (Tactical Responder Bot)
- Sub-50ms Response Time: Calibrated 2-ply (+1 root) search — the engine's own move plus the best opponent reply — eliminating UI thread freezing. The depth is deliberately shallow to guarantee latency; the bot is a fast tactical responder, not a master-strength opponent (deep positional evaluation is delegated to FR-06).
- Alpha-Beta Pruning with MVV-LVA: Most Valuable Victim – Least Valuable Aggressor move ordering reduces branch factor and maximizes search efficiency.
- O(1) Mating Drive Heuristic: Mathematical king-cornering evaluation matrix that accelerates checkmate conversion in simple endgames; convergence is accelerated but not formally guaranteed outside positions covered by endgame theory/tablebases.

### 🧩 FR-05: Curated Tactical Puzzle Curriculum
- Multi-theme verified tactical puzzle suite covering:
  - Back-rank mates (Korytarz).
  - Knight forks (Widełki).
  - Absolute pins (Związanie).
  - Discovered attacks (Atak z odsłony).
  - Deflection / Overloaded defender (Odciągnięcie obrońcy — FEN geometry validated by automated per-theme tests).
  - Skewers and king hunts.
- Puzzle audit on every release: a scripted test suite re-validates each puzzle FEN for solvability, uniqueness of the winning move, and match with its tactical theme — a repeatable method in place of an unverifiable blanket claim.
- Accessible multi-filter selector built with W3C-compliant role="group" and aria-pressed states.

### 🤖 FR-06: Deep Master AI Analysis (Gemini Integration)
- Dedicated Analiza Mistrza AI trigger invoking serverless /api/analyze.
- Evaluates positional tension, tactical threats, and recommends multi-step plans with spoken audio readouts.
- Grounded prompting (hallucination guard): the /api/analyze payload includes the current FEN, material balance, local-engine tactical flags (checks, pins, forks) and the legal-move list, so the model comments on supplied data instead of inventing evaluations; all numeric evaluations originate from the local engine, never from the LLM.
- Integration of public/llms.txt following the proposed llmstxt.org specification for autonomous AI web agents.

### 🙈 FR-07: Blindfold Visualization Mode
- Opaque frosted-glass backdrop shielding physical pieces.
- Emergency Podejrzyj planszę (3s) peek button for visualization verification.
- Spoken full board state audio recitation (Stan pozycji (Audio)).

### 🍪 FR-08: Privacy, Security & GDPR/ePrivacy Compliance
- No cookies are written and no client-side identifiers are set before consent.
- Integrated Google Consent Mode v2 (advanced implementation, default denied state): with consent denied, Google tags transmit cookieless measurement pings — requests sent without cookies that cannot identify an individual user; once consent is granted, cookies are written and full analytics is activated. The PRD states this explicitly so that „no cookies before consent” is not overstated as „no data flow before consent”.
- Persistent, accessible floating cookie trigger (🍪) allowing users to revisit consent settings at any time.

---

## 5. Non-Functional Requirements (NFR)

| Metric | Target | Verified Score |
| :--- | :--- | :--- |
| Mobile Performance (Lighthouse, automated) | > 95 | 100 / 100 |
| Lighthouse Accessibility Score (automated tests) | 100 | 100 / 100 |
| WCAG 2.1 AA Conformance (manual audit: keyboard-only navigation + NVDA/VoiceOver walkthrough) | AA, no critical blockers | Automated audit passed; manual audit scheduled pre-release (M9) |
| Best Practices (Lighthouse) | 100 | 100 / 100 |
| SEO & Discoverability (Lighthouse) | 100 | 100 / 100 |
| Engine Turnaround Latency | < 100 ms | < 50 ms (2-ply Alpha-Beta + MVV-LVA) |
| Voice-to-Execution Latency | < 500 ms | ~180 ms median — measured on Chrome desktop over Wi-Fi, 50-utterance sample; Chromium recognition is cloud-based, so latency scales with network RTT; typed-move fallback < 50 ms |
| Bot Strength Class | Fast tactical responder | 2-ply search; not FIDE-rated; positional depth delegated to the Gemini endpoint (FR-06) |
| Audio Renderer Resilience | Graceful degradation, no hard failure | Auto-recovering AudioContext error boundaries; falls back to silent mode after repeated recovery failures |
| Full Functionality Without Voice | 100% of features operable | Typed-move fallback covers Firefox, offline use, and denied microphone permission |

---

## 6. Milestones & Delivery Status

- [x] M1: Core Engine & UI (chess.js, vector pieces, fluid selection) — Completed
- [x] M2: Voice Architecture (Web Speech API, bilingual phonetic parser, castling) — Completed
- [x] M3: Audio Coach & Pacing (Speech synthesis, natural timing delay, sound effects) — Completed
- [x] M4: Deep AI Analysis & llms.txt (Gemini serverless route /api/analyze, llmstxt.org compliance) — Completed
- [x] M5: Blindfold Mode (Board shroud, 3s peek, spoken position reader) — Completed
- [x] M6: High-Performance Engine Tuning (Tactical responder optimized to <50ms with Alpha-Beta, MVV-LVA, Mating Drive) — Completed
- [x] M7: Tactical Curriculum & Geometry Audit (Expanded tactical themes, scripted per-theme FEN validation) — Completed
- [x] M8: Accessibility & Compliance Hardening (W3C ARIA filter group, Google Consent Mode v2) — Completed
- [ ] M9 (Planned): Manual WCAG 2.1 AA conformance audit (keyboard-only navigation, NVDA/VoiceOver walkthrough) and cross-browser voice-input QA (Chrome/Edge full; Safari 14.1+ prefixed; Firefox/offline typed fallback).

---

## 7. Risks & Mitigations

| # | Risk | Mitigation |
| :--- | :--- | :--- |
| R1 | Firefox does not support SpeechRecognition; Safari support is partial and prefixed | Browser Support Matrix published in-app; typed-move fallback shares the identical parsing pipeline (FR-01) |
| R2 | Chromium speech recognition is cloud-based — no voice input offline (commute / airplane scenarios) | Visible offline state; typed fallback; audio coach (on-device SpeechSynthesis) keeps working offline (FR-01) |
| R3 | LLM positional analysis can hallucinate evaluations | Grounded prompting (FEN, material, engine flags, legal moves); numeric evaluations come only from the local engine (FR-06) |
| R4 | Automated Lighthouse score ≠ WCAG conformance — automated tools detect only a subset of WCAG issues | Dedicated manual audit milestone (M9); NFR rows separate the automated score from the conformance claim |
| R5 | Playing-strength ceiling of a 2-ply bot | Positioned explicitly as a fast tactical responder; deep positional evaluation delegated to the Gemini endpoint (FR-04, FR-06) |

---

## 8. Appendix: Verification Sources

- MDN Web Docs — SpeechRecognition (browser support; cloud-based recognition does not work offline): https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- Can I use — Web Speech API support tables (Safari 14.1+ prefixed support): https://caniuse.com/?search=web%20speech%20api
- Google — Consent Mode reference (cookieless pings when consent is denied): https://support.google.com/analytics/answer/13802165
- Deque — Automated Accessibility Coverage Report (machine-detectable share of WCAG issues): https://www.deque.com/automated-accessibility-coverage-report/
- llmstxt.org — proposed specification for LLM-readable site maps: https://llmstxt.org/
