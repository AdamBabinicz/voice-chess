// lib/translations.ts

export type Lang = "en" | "pl";

export interface TranslationSchema {
  nav: string[];
  subline: string;
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  start: string;
  explore: string;
  streak: string;
  rating: string;
  sessions: string;
  live: string;
  turnWhite: string;
  turnBlack: string;
  coach: string;
  defaultCoachText: string;
  moves: string;
  listen: string;
  visible: string;
  blind: string;
  peek: string;
  statusAudio: string;
  blindfoldDesc: string;
  settings: string;
  done: string;
  hint: string;
  replay: string;
  aiAnalysisBtn: string;
  aiAnalyzing: string;
  language: string;
  voiceSpeed: string;
  difficulty: string;
  beginner: string;
  intermediate: string;
  master: string;
  voiceInput: string;
  continuous: string;
  push: string;
  muteCoach: string;
  unmuteCoach: string;
  coachVoiceActive: string;
  tacticsTitle: string;
  tacticsBody: string;
  activePuzzleBadge: string;
  howTitle: string;
  howSteps: string[];
  cookie: string;
  accept: string;
  reject: string;
  privacy: string;
  terms: string;
  description: string;
  close: string;
  backTop: string;
  newGameBtn: string;
  undoBtn: string;
  listeningText: string;
  startVoiceText: string;
  inputPlaceholder: string;
  submitMoveText: string;
  unsupportedSpeech: string;
  speechError: string;
  unrecognizedMove: string;
}

export const translations: Record<Lang, TranslationSchema> = {
  en: {
    nav: ["Audio Coach", "Tactics", "Play", "How it works"],
    subline: "Audio Coach",
    eyebrow: "VOICE-FIRST CHESS TRAINING",
    title: "Play chess beyond",
    accent: "the board.",
    body: "A focused audio coach for confident moves, sharper tactics, and blindfold play. Speak your move. Hear the position.",
    start: "Start a session",
    explore: "Explore tactics",
    streak: "day streak",
    rating: "training rating",
    sessions: "sessions completed",
    live: "LIVE SESSION",
    turnWhite: "Your turn · White",
    turnBlack: "Your turn · Black",
    coach: "Coach insight",
    defaultCoachText:
      "Your knight is active on f3. The center is open — look for a safe way to castle.",
    moves: "Moves",
    listen: "Listening for your move…",
    visible: "Board visible",
    blind: "Blindfold mode",
    peek: "Peek board (3s)",
    statusAudio: "Speak position state",
    blindfoldDesc:
      "Visualize the position in your mind. Listen to coach instructions.",
    settings: "Settings",
    done: "Done",
    hint: "Tap two squares to move",
    replay: "Replay insight",
    aiAnalysisBtn: "Master AI Insight",
    aiAnalyzing: "Analyzing position…",
    language: "Coach language",
    voiceSpeed: "Voice speed",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    master: "Master",
    voiceInput: "Voice input mode",
    continuous: "Continuous listening",
    push: "Press to speak",
    muteCoach: "Mute coach voice",
    unmuteCoach: "Enable coach voice",
    coachVoiceActive: "Coach voice audio",
    tacticsTitle: "Tactical puzzles",
    tacticsBody: "Sharpen the tactical motifs that win games in every phase.",
    activePuzzleBadge: "Active puzzle",
    howTitle: "How it works",
    howSteps: ["Choose a position", "Speak your move", "Hear clear feedback"],
    cookie: "We use cookies and local storage to preserve your preferences.",
    accept: "Accept all",
    reject: "Reject optional",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    description:
      "Voice-first chess training for sharper decisions and confident play.",
    close: "Close",
    backTop: "Scroll to top",
    newGameBtn: "New game",
    undoBtn: "Undo",
    listeningText: "Listening... Say a move like “e4”",
    startVoiceText: "Start voice input",
    inputPlaceholder: "Type a move, e.g. e4, Nf3, O-O",
    submitMoveText: "Make move",
    unsupportedSpeech: "Speech recognition is not supported in this browser.",
    speechError: "Microphone access failed. Type a move below.",
    unrecognizedMove: "Unrecognized move",
  },
  pl: {
    nav: ["Trener audio", "Taktyka", "Zagraj", "Jak to działa"],
    subline: "Trener Szachowy Audio",
    eyebrow: "SZACHY STEROWANE GŁOSEM",
    title: "Graj poza",
    accent: "szachownicą.",
    body: "Skupiony trener audio dla lepszych decyzji, ostrzejszej taktyki i gry w ciemno. Wypowiedz ruch. Usłysz pozycję.",
    start: "Rozpocznij sesję",
    explore: "Poznaj taktykę",
    streak: "dni z rzędu",
    rating: "ranking treningowy",
    sessions: "ukończonych sesji",
    live: "SESJA NA ŻYWO",
    turnWhite: "Twój ruch · Białe",
    turnBlack: "Twój ruch · Czarne",
    coach: "Wskazówka trenera",
    defaultCoachText:
      "Wypowiedz lub wykonaj ruch na szachownicy. Trener przeanalizuje Twoje posunięcie.",
    moves: "Ruchy",
    listen: "Słucham Twojego ruchu…",
    visible: "Plansza widoczna",
    blind: "Tryb gry w ciemno",
    peek: "Podejrzyj planszę (3s)",
    statusAudio: "Stan pozycji (Audio)",
    blindfoldDesc: "Wyobraź sobie pozycję. Słuchaj wskazówek trenera.",
    settings: "Ustawienia",
    done: "Gotowe",
    hint: "Dotknij dwóch pól, aby wykonać ruch",
    replay: "Odsłuchaj wskazówkę",
    aiAnalysisBtn: "Analiza Mistrza AI",
    aiAnalyzing: "Analizuję pozycję…",
    language: "Język trenera",
    voiceSpeed: "Szybkość głosu",
    difficulty: "Poziom trudności",
    beginner: "Początkujący",
    intermediate: "Średniozaawansowany",
    master: "Mistrz",
    voiceInput: "Tryb głosowy",
    continuous: "Nasłuch ciągły",
    push: "Naciśnij, aby mówić",
    muteCoach: "Wycisz głos trenera",
    unmuteCoach: "Włącz głos trenera",
    coachVoiceActive: "Głos lektora trenera",
    tacticsTitle: "Taktyczne łamigłówki",
    tacticsBody:
      "Ćwicz motywy taktyczne, które decydują o zwycięstwie w każdej partii.",
    activePuzzleBadge: "Aktywne zadanie",
    howTitle: "Jak to działa",
    howSteps: ["Wybierz pozycję", "Wypowiedz ruch", "Usłysz jasną wskazówkę"],
    cookie:
      "Używamy pamięci podręcznej i ciasteczek, aby zapamiętać Twoje ustawienia audio i motyw.",
    accept: "Zaakceptuj wszystkie",
    reject: "Odrzuć opcjonalne",
    privacy: "Polityka prywatności",
    terms: "Regulamin serwisu",
    description:
      "Trening szachowy oparty na głosie dla lepszych decyzji i pewniejszej gry.",
    close: "Zamknij",
    backTop: "Wróć na górę",
    newGameBtn: "Nowa partia",
    undoBtn: "Cofnij",
    listeningText: "Słucham... Wypowiedz ruch (np. „e4”, „skoczek f3”)",
    startVoiceText: "Rozpocznij nasłuch głosu",
    inputPlaceholder: "Wpisz ruch, np. e4, Nf3, O-O",
    submitMoveText: "Wykonaj",
    unsupportedSpeech: "Przeglądarka nie obsługuje rozpoznawania mowy.",
    speechError: "Błąd mikrofonu lub brak zezwolenia. Wpisz ruch w polu.",
    unrecognizedMove: "Nierozpoznany ruch",
  },
};
