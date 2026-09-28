// components/cookie-consent.tsx
"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookieConsentProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenPrivacy: () => void;
  cookieText: string;
  privacyText: string;
  rejectText: string;
  acceptText: string;
  backTopText: string;
  cookieSettingsText: string;
}

export function CookieConsent({
  isOpen,
  onOpen,
  onClose,
  onOpenPrivacy,
  cookieText,
  privacyText,
  rejectText,
  acceptText,
  backTopText,
  cookieSettingsText,
}: CookieConsentProps) {
  const [mounted, setMounted] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setShowTop(window.scrollY > 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cookie_consent_accepted" });
    }
    onClose();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Baner zgód na dole ekranu */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 z-40 flex flex-col gap-4 rounded-2xl border border-[#d5e1d0] bg-white p-5 shadow-2xl dark:border-[#334238] dark:bg-[#1d2820] sm:inset-x-auto sm:right-6 sm:max-w-xl sm:flex-row sm:items-center">
          <p className="flex-1 text-xs text-[#2a362f] dark:text-[#e2e8f0] sm:text-sm">
            {cookieText}{" "}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="font-semibold underline cursor-pointer"
            >
              {privacyText}
            </button>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              {rejectText}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white shadow hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-stone-950 dark:hover:bg-[#b8de53] transition-colors cursor-pointer"
            >
              {acceptText}
            </button>
          </div>
        </div>
      )}

      {/* Dyskretny przycisk ciasteczka do ponownego otwarcia (RODO / ePrivacy) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={cookieSettingsText}
          title={cookieSettingsText}
          className="fixed bottom-6 left-6 z-30 flex size-11 items-center justify-center rounded-full border border-[#d5e1d0] bg-white text-[#2d4e13] shadow-lg transition-all hover:scale-105 active:scale-95 dark:border-[#334238] dark:bg-[#18201b] dark:text-[#bcee68] cursor-pointer"
        >
          <Cookie className="size-5" />
        </button>
      )}

      {/* Przycisk powrotu na górę strony */}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={backTopText}
          className={cn(
            "fixed bottom-6 z-30 flex size-11 items-center justify-center rounded-full bg-[#17201c] text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-[#c8ee63] dark:text-[#17201c] cursor-pointer",
            !isOpen ? "left-20" : "left-6",
          )}
        >
          ↑
        </button>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
