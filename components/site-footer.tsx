// components/site-footer.tsx
"use client";

interface SiteFooterProps {
  lang: "en" | "pl";
  dark: boolean;
  description: string;
  privacyLabel: string;
  termsLabel: string;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCookies: () => void;
}

export function SiteFooter({
  lang,
  dark,
  description,
  privacyLabel,
  termsLabel,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCookies,
}: SiteFooterProps) {
  const cookieSettingsLabel =
    lang === "pl" ? "Ustawienia plików cookie" : "Cookie settings";

  return (
    <footer className="relative z-40 border-t border-[#dfe5dc] px-5 pt-10 pb-28 sm:pb-12 dark:border-[#29332e]">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 text-sm text-[#3c4a41] dark:text-[#cbd5e1] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <strong className="font-serif text-[#17201c] dark:text-white">
            ChessTactics
          </strong>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#424e46] dark:text-[#cbd5e1]">
            {description}
          </p>
          <p className="mt-2 text-xs text-[#424e46] dark:text-[#94a3b8]">
            © 2026 ChessTactics. All rights reserved.
          </p>
        </div>

        <div className="relative z-50 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <span>
            {lang.toUpperCase()} · {dark ? "Dark" : "Light"}
          </span>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="underline text-[#3c4a41] dark:text-[#cbd5e1] hover:text-[#17201c] dark:hover:text-white cursor-pointer"
          >
            {privacyLabel}
          </button>
          <button
            type="button"
            onClick={onOpenTerms}
            className="underline text-[#3c4a41] dark:text-[#cbd5e1] hover:text-[#17201c] dark:hover:text-white cursor-pointer"
          >
            {termsLabel}
          </button>
          <button
            type="button"
            onClick={onOpenCookies}
            className="underline text-[#3c4a41] dark:text-[#cbd5e1] hover:text-[#17201c] dark:hover:text-white cursor-pointer"
          >
            {cookieSettingsLabel}
          </button>
        </div>
      </div>
    </footer>
  );
}
