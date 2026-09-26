// components/legal-modal.tsx
"use client";

import React from "react";

type LegalType = "privacy" | "terms" | null;

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
  labels: {
    privacyTitle: string;
    termsTitle: string;
    close: string;
  };
}

export function LegalModal({ type, onClose, labels }: LegalModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-dialog-title"
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-[#1d2820] sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <h2
            id="legal-dialog-title"
            className="text-xl sm:text-2xl font-bold font-serif"
          >
            {type === "privacy" ? labels.privacyTitle : labels.termsTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="text-2xl text-stone-500 hover:text-stone-950 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {type === "privacy" ? (
          <div className="mt-6 flex flex-col gap-4 text-xs sm:text-sm leading-relaxed text-[#59665d] dark:text-[#b8c5bb]">
            <p>
              <strong>Administrator danych:</strong> ChessTactics Audio Coach
              jest aplikacją działającą w Twojej przeglądarce.
            </p>
            <p>
              <strong>Przetwarzanie głosu:</strong> Rozpoznawanie mowy odbywa
              się lokalnie za pośrednictwem Web Speech API. Nagrania audio NIE
              są utrwalane na serwerach zewnętrznych.
            </p>
            <p>
              <strong>Pliki cookies i pamięć podręczna:</strong> Przechowujemy
              wyłącznie ustawienia użytkownika (motyw, język, parametry mowy)
              oraz zgody.
            </p>
            <p>
              <strong>Prawa użytkownika (RODO):</strong> W każdej chwili możesz
              zresetować dane w przeglądarce lub wycofać zgodę w panelu
              Ustawień.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4 text-xs sm:text-sm leading-relaxed text-[#59665d] dark:text-[#b8c5bb]">
            <p>
              <strong>Usługa:</strong> ChessTactics udostępnia interaktywne
              narzędzie do nauki gry w szachy i treningu w ciemno z użyciem
              głosu.
            </p>
            <p>
              <strong>Dostępność:</strong> Usługa jest darmowa i zoptymalizowana
              dla graczy z niepełnosprawnościami wzroku (WCAG 2.1).
            </p>
            <p>
              <strong>Zasady fair play:</strong> Użytkownik korzysta z aplikacji
              zgodnie z jej przeznaczeniem edukacyjnym.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
