// lib/tactical-puzzles.ts

export interface TacticalPuzzle {
  id: number;
  title: { pl: string; en: string };
  desc: { pl: string; en: string };
  difficulty: "beginner" | "intermediate" | "master";
  difficultyLabel: { pl: string; en: string };
  icon: string;
  fen: string;
  hint: { pl: string; en: string };
  verify: (san: string) => boolean;
  successText: { pl: string; en: string };
  failureText: { pl: string; en: string };
}

export const TACTICAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 0,
    title: { pl: "Widełki skoczkiem", en: "Knight Fork" },
    desc: {
      pl: "Zaszachuj króla i zaatakuj bierki w obozie rywala",
      en: "Check the king and fork pieces in enemy camp",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♞",
    fen: "r1b1k2r/pp1p1ppp/2n1pn2/8/2N1P3/2P5/P1PB1PPP/R3KB1R w KQkq - 0 1",
    hint: {
      pl: "Zadanie: Widełki skoczkiem! Białe zaczynają i zdobywają decydującą przewagę. Znajdź ruch skoczkiem atakujący dwie bierki!",
      en: "Puzzle: Knight Fork! White to move and gain a winning advantage. Find the fork!",
    },
    verify: (san: string) =>
      san.startsWith("Nd6") || san.startsWith("Nc7") || san.includes("d6+"),
    successText: {
      pl: "Genialnie! Znakomite widełki skoczkiem. Król przeciwnika jest w szachu, a jego obrona pęka. Zadanie rozwiązane!",
      en: "Brilliant! Superb knight fork. The enemy king is in check and defense collapses. Puzzle solved!",
    },
    failureText: {
      pl: "Niezły ruch, ale to nie są widełki. Szukaj pola dla skoczka, z którego zaszachuje króla i jednocześnie zaatakuje inną bierkę!",
      en: "Decent move, but that is not the fork. Look for a square where your knight delivers check while attacking another piece!",
    },
  },
  {
    id: 1,
    title: { pl: "Mat na ostatniej linii", en: "Back Rank Mate" },
    desc: {
      pl: "Wykorzystaj zablokowanie króla przez własne piony",
      en: "Exploit king trapped by its own pawns",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♚",
    fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1",
    hint: {
      pl: "Zadanie: Mat na ostatniej linii! Białe zaczynają. Znajdź decydujący cios hetmanem kończący partię matem!",
      en: "Puzzle: Back rank checkmate! White to move and deliver immediate mate!",
    },
    verify: (san: string) =>
      san.includes("Qe8") || san.includes("Qe8#") || san.includes("Qd8"),
    successText: {
      pl: "Szach i mat! Wykorzystujesz słabość 8. linii. Król czarnych został odcięty za własnymi pionami. Zadanie rozwiązane!",
      en: "Checkmate! Exploiting the 8th rank weakness. Black's king was trapped behind its own pawns. Puzzle solved!",
    },
    failureText: {
      pl: "To nie prowadzi do natychmiastowego mata. Spójrz na 8. linię rywala — czy jest tam jakikolwiek obrońca?",
      en: "That does not force immediate mate. Look at the opponent's 8th rank — is there any defender?",
    },
  },
  {
    id: 2,
    title: { pl: "Związanie gońcem", en: "Absolute Pin" },
    desc: {
      pl: "Przygwoźdź figurę wzdłuż przekątnej przed królem",
      en: "Pin heavy pieces along the diagonal",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "♝",
    fen: "4k3/4q3/8/8/8/2B5/4Q3/4K3 w - - 0 1",
    hint: {
      pl: "Zadanie: Związanie gońcem! Wykorzystaj bezwzględne związanie figury przeciwnika przed królem!",
      en: "Puzzle: Absolute pin! Exploit the enemy piece pinned against the king!",
    },
    verify: (san: string) =>
      san.includes("xe7") || san.startsWith("B") || san.includes("Bxe7"),
    successText: {
      pl: "Świetnie! Wykorzystujesz bezwzględne związanie. Związana figura nie może uciec i pada Twoim łupem. Zadanie rozwiązane!",
      en: "Great job! Exploiting the absolute pin. The pinned piece cannot escape and falls to your attack. Puzzle solved!",
    },
    failureText: {
      pl: "Nie wykorzystujesz jeszcze pełnego potencjału związania. Poszukaj zbicia figury stojącej bezpośrednio przed królem!",
      en: "Not quite capitalizing on the pin yet. Look to capture the piece standing directly before the king!",
    },
  },
  {
    id: 3,
    title: { pl: "Szpila wieżą (Rentgen)", en: "Rook Skewer" },
    desc: {
      pl: "Zaatakuj cenniejszą figurę, by zdobyć tę za nią",
      en: "Attack the king to capture the queen behind it",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "♜",
    fen: "4k2q/8/8/8/8/8/8/R5K1 w - - 0 1",
    hint: {
      pl: "Zadanie: Szpila wieżą! Biała wieża widzi króla na e8 i hetmana na h8 w jednej linii. Wykorzystaj ten motyw geometryczny!",
      en: "Puzzle: Rook skewer! The white rook aligns with the king on e8 and queen on h8. Exploit this geometry!",
    },
    verify: (san: string) => san.startsWith("Ra8") || san.includes("Ra8+"),
    successText: {
      pl: "Doskonale! Szach wieżą na a8 zmusza króla do ucieczki, a bezcenny hetman na h8 zostaje bez obrony i pada w kolejnym ruchu!",
      en: "Splendid! The rook check on a8 forces the king away, leaving the unprotected queen on h8 to fall next move!",
    },
    failureText: {
      pl: "To nie jest motyw szpili. Poszukaj ruchu wieżą po otwartej linii, który zaszachuje króla wzdłuż linii jego hetmana!",
      en: "That is not the skewer. Look for a rook move on the open rank checking the king along his queen's rank!",
    },
  },
  {
    id: 4,
    title: { pl: "Atak z odsłony", en: "Discovered Attack" },
    desc: {
      pl: "Odsłoń linię ataku z jednoczesnym szachem",
      en: "Unmask attack line while delivering check",
    },
    difficulty: "master",
    difficultyLabel: { pl: "Mistrz", en: "Master" },
    icon: "⚡",
    fen: "3qk3/8/8/3B4/8/8/8/3QK3 w - - 0 1",
    hint: {
      pl: "Zadanie: Atak z odsłony! Goniec zasłania linię hetmanów d1-d8. Odejdź gońcem z szachem, by w kolejnym ruchu wziąć hetmana za darmo!",
      en: "Puzzle: Discovered attack! The bishop blocks the d-file. Move the bishop with check to win Black's queen next!",
    },
    verify: (san: string) =>
      san.startsWith("Bf7") ||
      san.startsWith("Bc6") ||
      san.includes("f7+") ||
      san.includes("c6+") ||
      san.startsWith("Bh7") ||
      san.startsWith("Be6"),
    successText: {
      pl: "Arcymistrzowskie posunięcie! Odejście gońca z szachem odsłania zabójczą linię d1-d8. Czarny hetman jest stracony!",
      en: "Grandmaster precision! Moving the bishop with check unmasks the deadly d-file attack. Black's queen is doomed!",
    },
    failureText: {
      pl: "To nie uwalnia pełnej siły ataku z odsłony. Poszukaj takiego odejścia gońcem, które natychmiast zmusi króla do reakcji (szach)!",
      en: "That misses the full punch of the discovered attack. Look for a bishop jump that immediately forces a king response!",
    },
  },
  {
    id: 5,
    title: { pl: "Współpraca bierek (Mat)", en: "Support Checkmate" },
    desc: {
      pl: "Szybki atak na najsłabszy punkt f7",
      en: "Direct strike on the vulnerable f7 square",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♕",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    hint: {
      pl: "Zadanie: Koordynacja ataku! Goniec z c4 celuje w słaby punkt f7, a hetman z f3 czeka na rozkaz. Znajdź natychmiastowego mata!",
      en: "Puzzle: Attack coordination! The bishop on c4 and queen on f3 target f7. Deliver immediate checkmate!",
    },
    verify: (san: string) => san.includes("Qxf7") || san.includes("Qxf7#"),
    successText: {
      pl: "Bum! Szach i mat na f7! Współpraca hetmana i gońca przynosi natychmiastowe zwycięstwo. Zadanie rozwiązane!",
      en: "Boom! Checkmate on f7! Seamless coordination between queen and bishop secures instant victory!",
    },
    failureText: {
      pl: "Brak precyzji. Spójrz na pole f7 — jest bronione wyłącznie przez czarnego króla!",
      en: "Lacks precision. Focus on the f7 square — it is guarded solely by Black's king!",
    },
  },
  {
    id: 6,
    title: { pl: "Mat hetmanem i królem", en: "Queen & King Mate" },
    desc: {
      pl: "Zepchnięcie monarchy do narożnika i mat przy wsparciu króla",
      en: "Corner the enemy king and deliver mate with king support",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "👑",
    fen: "k7/8/1K6/8/8/8/8/2Q5 w - - 0 1",
    hint: {
      pl: "Końcówka: Mat hetmanem i królem! Król czarnych uwięziony na a8, a Twój król na b6 kontroluje pola ucieczki a7 i b7. Wtargnij hetmanem na 8. linię z matem!",
      en: "Endgame: Queen & King checkmate! Black's king is trapped on a8 while your king on b6 guards escape squares. Invade the 8th rank with checkmate!",
    },
    verify: (san: string) => san.includes("Qc8") || san.includes("Qc8#"),
    successText: {
      pl: "Doskonale! Szach i mat na c8! Opozycja królów i potęga hetmana nie dają czarnym żadnych szans. Zadanie rozwiązane!",
      en: "Splendid! Checkmate on c8! The king's support and queen's power leave Black with no escape. Puzzle solved!",
    },
    failureText: {
      pl: "To nie jest mat. Pamiętaj: hetman z pola c8 szachuje króla na a8, a król z b6 odbiera mu pole ucieczki b7. Spróbuj jeszcze raz!",
      en: "That is not checkmate. Remember: queen to c8 delivers check, while king on b6 prevents b7 escape. Try again!",
    },
  },
  {
    id: 7,
    title: { pl: "Mat wieżą i królem", en: "Rook & King Mate" },
    desc: {
      pl: "Opozycja królów i decydujący cios wieżą na bandzie",
      en: "King opposition and decisive rook strike along the edge",
    },
    difficulty: "beginner",
    difficultyLabel: { pl: "Początkujący", en: "Beginner" },
    icon: "♖",
    fen: "4k3/8/4K3/8/8/8/8/R7 w - - 0 1",
    hint: {
      pl: "Końcówka: Mat wieżą i królem! Króle stoją w bezpośredniej opozycji (e6 vs e8). Czarny król nie może pójść do przodu. Uderz wieżą z a1 na 8. linię!",
      en: "Endgame: Rook & King checkmate! The kings stand in direct opposition (e6 vs e8). Attack the 8th rank with your rook!",
    },
    verify: (san: string) => san.includes("Ra8") || san.includes("Ra8#"),
    successText: {
      pl: "Perfekcyjnie! Szach i mat na a8. Twój król zablokował pola ucieczki d7, e7 i f7, a wieża odcięła całą 8. linię!",
      en: "Perfect! Checkmate on a8. Your king covers d7, e7 and f7, while the rook controls the entire 8th rank!",
    },
    failureText: {
      pl: "To nie daje natychmiastowego mata. Wykorzystaj fakt, że króle stoją w opozycji — wieża musi zadać cios z 8. linii!",
      en: "That does not force immediate mate. Exploit the king opposition — your rook must strike along the 8th rank!",
    },
  },
  {
    id: 8,
    title: { pl: "Podwójny szach", en: "Double Check" },
    desc: {
      pl: "Jednoczesny szach dwoma figurami zmuszający króla do ucieczki",
      en: "Simultaneous check by two pieces forcing king flight",
    },
    difficulty: "master",
    difficultyLabel: { pl: "Mistrz", en: "Master" },
    icon: "⚔️",
    fen: "r1bqk2r/pppp1ppp/2n5/3B2N1/8/8/PPPP1PPP/R1BQR1K1 w kq - 0 1",
    hint: {
      pl: "Zadanie: Podwójny szach! Zbij piona f7 gońcem. Zaszachujesz króla bezpośrednio, a wieża z e1 zada drugi szach z odsłony!",
      en: "Puzzle: Double check! Capture on f7 with the bishop. You deliver check directly, while the rook on e1 delivers check by discovery!",
    },
    verify: (san: string) => san.startsWith("Bxf7") || san.startsWith("Bf7"),
    successText: {
      pl: "Arcymistrzowskie uderzenie! Podwójny szach od gońca na f7 i wieży na e1. Przed podwójnym szachem nie można się zasłonić ani zbić figury — czarny król musi uciekać!",
      en: "Grandmaster strike! Double check from bishop on f7 and rook on e1. Against double check, blocking or capturing is impossible — the king must move!",
    },
    failureText: {
      pl: "To nie jest podwójny szach. Zbij gońcem piona na f7 — zadasz szacha gońcem i jednocześnie odsłonisz wieżę na linii e!",
      en: "That is not double check. Capture the f7 pawn with your bishop to check with both bishop and rook!",
    },
  },
  {
    id: 9,
    title: { pl: "Mat zduszony (Beniowskiego)", en: "Smothered Mate" },
    desc: {
      pl: "Król uwięziony we własnym obozie pada ofiarą skoczka",
      en: "Trapped king suffocated by its own pieces falls to the knight",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "🐴",
    fen: "6rk/6pp/7N/8/8/8/8/4K3 w - - 0 1",
    hint: {
      pl: "Zadanie: Mat zduszony! Król czarnych na h8 jest szczelnie zablokowany przez własną wieżę g8 i piony g7, h7. Wkrocz skoczkiem na f7!",
      en: "Puzzle: Smothered Mate! Black's king on h8 is trapped by its own rook on g8 and pawns g7, h7. Jump to f7 with your knight!",
    },
    verify: (san: string) => san.includes("Nf7") || san.includes("Nf7#"),
    successText: {
      pl: "Genialnie! Klasyczny mat zduszony (Smothered Mate). Własne bierki czarnych odcięły królowi wszystkie drogi ucieczki!",
      en: "Brilliant! The classic Smothered Mate. Black's own pieces suffocated their king, leaving no square of escape!",
    },
    failureText: {
      pl: "To nie mat. Skoczek z pola h6 ma tylko jedno mistrzowskie pole docelowe: f7. Spróbuj zagrać skoczkiem na f7!",
      en: "That is not checkmate. The knight on h6 has only one winning destination: f7. Try knight to f7!",
    },
  },
  {
    id: 10,
    title: { pl: "Ofiara Greka (Bxh7+)", en: "Greek Gift" },
    desc: {
      pl: "Rozbij osłonę roszady klasyczną ofiarą gońca",
      en: "Shatter the castled shelter with a classic bishop sacrifice",
    },
    difficulty: "intermediate",
    difficultyLabel: { pl: "Średniozaawansowany", en: "Intermediate" },
    icon: "🏛️",
    fen: "r1bq1rk1/ppp2ppp/2n1p3/8/3P4/2PB1N2/PP3PPP/R2QK2R w KQ - 0 1",
    hint: {
      pl: "Motyw taktyczny: Ofiara Greka! Goniec z d3 celuje prosto w piona h7. Poświęć gońca ruchem Bxh7+, by wyciągnąć monarchy rywala na zewnątrz!",
      en: "Tactical Motif: Greek Gift! Bishop on d3 aims directly at the h7 pawn. Sacrifice the bishop with Bxh7+ to lure the king into the open!",
    },
    verify: (san: string) => san.startsWith("Bxh7") || san.includes("Bxh7+"),
    successText: {
      pl: "Genialna ofiara Greka (Bxh7+)! Czarny król zostaje pozbawiony osłony i wyciągnięty na otwarte pole, gdzie czeka go zabójczy atak skoczka i hetmana!",
      en: "Brilliant Greek Gift (Bxh7+)! The enemy king is stripped of shelter and lured into the open for a crushing knight and queen follow-up!",
    },
    failureText: {
      pl: "To nie rozbija obrony rywala. Zbij piona h7 gońcem z szachem — to legendarna ofiara otwierająca drogę do zwycięstwa!",
      en: "That misses the breakthrough. Capture the h7 pawn with check — the legendary sacrifice that shatters the fortress!",
    },
  },
  {
    id: 11,
    title: { pl: "Odciągnięcie obrońcy", en: "Deflection" },
    desc: {
      pl: "Odciągnij figurę pilnującą kluczowego pola lub linii",
      en: "Deflect a piece guarding a critical square or rank",
    },
    difficulty: "master",
    difficultyLabel: { pl: "Mistrz", en: "Master" },
    icon: "🎯",
    fen: "3r2k1/3q1ppp/8/8/8/8/4QPPP/3R2K1 w - - 0 1",
    hint: {
      pl: "Motyw taktyczny: Odciągnięcie obrońcy! Czarna wieża na d8 pilnuje 8. linii przed matem hetmanem. Zbij hetmana na d7 ruchem wieży (Rxd7!), odciągając czarną wieżę od obrony 8. linii!",
      en: "Tactical Motif: Deflection! Black's rook on d8 guards the 8th rank. Capture the queen on d7 with your rook (Rxd7!), deflecting Black's rook from 8th rank defense!",
    },
    verify: (san: string) =>
      san.startsWith("Rxd7") ||
      san.startsWith("Rd7") ||
      san.includes("xd7") ||
      san.startsWith("Qe7"),
    successText: {
      pl: "Genialne odciągnięcie (Rxd7!)! Czarna wieża musi odbić na d7, opuszczając 8. linię, co pozwala Twojemu hetmanowi zadać natychmiastowego mata na e8 (Qe8#)!",
      en: "Superb deflection (Rxd7!)! Black's rook is forced to recapture on d7, abandoning the 8th rank and allowing your queen to deliver checkmate on e8 (Qe8#)!",
    },
    failureText: {
      pl: "To nie odciąga obrońcy. Zbij czarnego hetmana wieżą na d7 (Rxd7!) — czarna wieża będzie musiała odbić, porzucając obronę 8. linii!",
      en: "That does not deflect the defender. Capture Black's queen with your rook on d7 (Rxd7!) — Black's rook must recapture, abandoning the 8th rank!",
    },
  },
];

/**
 * Weryfikuje rozwiązania dla zadań taktycznych
 */
export function evaluateTacticalPuzzle(
  puzzleIndex: number,
  moveSan: string,
  lang: "en" | "pl",
): { isCorrect: boolean; insight: string; audioText: string } {
  const puzzle = TACTICAL_PUZZLES[puzzleIndex];

  if (!puzzle) {
    const pl = `Ruch wykonany. Analizuj dalszą pozycję.`;
    const en = `Move executed. Continue analyzing the position.`;
    return { isCorrect: true, insight: pl, audioText: lang === "pl" ? pl : en };
  }

  const isCorrect = puzzle.verify(moveSan);

  if (isCorrect) {
    const text = puzzle.successText[lang];
    return {
      isCorrect: true,
      insight: text,
      audioText: text,
    };
  } else {
    const text = puzzle.failureText[lang];
    return {
      isCorrect: false,
      insight: text,
      audioText: text,
    };
  }
}
