// components/cookie-consent.tsx
"use client";

import { useEffect, useState, useRef } from "react";

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
  onClose,
  onOpenPrivacy,
  cookieText,
  privacyText,
  rejectText,
  acceptText,
  backTopText,
}: CookieConsentProps) {
  const [mounted, setMounted] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    setMounted(true);

    // Wykonaj sprawdzenie localStorage TYLKO RAZ przy starcie aplikacji
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      try {
        const savedConsent = localStorage.getItem("cookie_consent_state");
        if (savedConsent) {
          // Jeśli decyzja już była podjęta wcześniej, zamknij domyślnie otwarty baner
          onClose();

          // I przekaż stan do Google Consent Mode
          if (
            typeof window !== "undefined" &&
            typeof window.gtag === "function"
          ) {
            if (savedConsent === "accepted") {
              window.gtag("consent", "update", {
                analytics_storage: "granted",
              });
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: "cookie_consent_accepted" });
            } else {
              window.gtag("consent", "update", {
                analytics_storage: "denied",
              });
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: "cookie_consent_rejected" });
            }
          }
        }
      } catch {
        // Ignoruj błąd dostępu do localStorage
      }
    }

    const onScroll = () => {
      setShowTop(window.scrollY > 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onClose]);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie_consent_state", "accepted");
    } catch {
      // Ignoruj
    }

    if (typeof window !== "undefined") {
      // 1. Google Consent Mode v2 update
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }

      // 2. DataLayer event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "cookie_consent_accepted",
      });
    }
    onClose();
  };

  const handleReject = () => {
    try {
      localStorage.setItem("cookie_consent_state", "rejected");
    } catch {
      // Ignoruj
    }

    if (typeof window !== "undefined") {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "cookie_consent_rejected",
      });
    }
    onClose();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Baner zgód - z-[9999] gwarantuje, że pojawi się ponad widżetem Tag Assistanta */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 z-[9999] flex flex-col gap-4 rounded-2xl border border-[#d5e1d0] bg-white p-5 shadow-2xl dark:border-[#334238] dark:bg-[#1d2820] sm:inset-x-auto sm:right-6 sm:max-w-xl sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-4 duration-200">
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
              onClick={handleReject}
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

      {/* Przycisk powrotu na górę strony */}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={backTopText}
          className="fixed bottom-6 left-6 z-30 flex size-11 items-center justify-center rounded-full bg-[#17201c] text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-[#c8ee63] dark:text-[#17201c] cursor-pointer"
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
    gtag?: (...args: unknown[]) => void;
  }
}
