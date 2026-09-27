// components/settings-modal.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "pl";
  setLang: (lang: "en" | "pl") => void;
  blind: boolean;
  setBlind: (blind: boolean) => void;
  coachMuted?: boolean;
  setCoachMuted?: (muted: boolean) => void;
  speed: string;
  setSpeed: (speed: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  voiceMode: "continuous" | "push";
  setVoiceMode: (mode: "continuous" | "push") => void;
  labels: {
    title: string;
    language: string;
    blind: string;
    voiceSpeed: string;
    difficulty: string;
    beginner: string;
    intermediate: string;
    master: string;
    voiceInput: string;
    continuous: string;
    push: string;
    coachVoiceActive?: string;
    done: string;
    close: string;
  };
}

export function SettingsModal({
  isOpen,
  onClose,
  lang,
  setLang,
  blind,
  setBlind,
  coachMuted = false,
  setCoachMuted,
  speed,
  setSpeed,
  difficulty,
  setDifficulty,
  voiceMode,
  setVoiceMode,
  labels,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-[#1d2820] sm:p-7"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <h2
            id="settings-dialog-title"
            className="text-xl font-bold font-serif"
          >
            {labels.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="text-2xl text-stone-500 hover:text-stone-950 dark:hover:text-white cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-xs sm:text-sm">
          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">{labels.language}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "pl")}
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-1.5 dark:border-stone-700"
            >
              <option value="en" className="dark:bg-stone-900">
                English
              </option>
              <option value="pl" className="dark:bg-stone-900">
                Polski
              </option>
            </select>
          </label>

          {setCoachMuted && (
            <label className="flex items-center justify-between gap-4">
              <span className="font-semibold">
                {labels.coachVoiceActive || "Głos trenera"}
              </span>
              <input
                type="checkbox"
                checked={!coachMuted}
                onChange={(e) => setCoachMuted(!e.target.checked)}
                className="size-5 rounded accent-[#789b35]"
              />
            </label>
          )}

          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">{labels.blind}</span>
            <input
              type="checkbox"
              checked={blind}
              onChange={(e) => setBlind(e.target.checked)}
              className="size-5 rounded accent-[#789b35]"
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">{labels.voiceSpeed}</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-1.5 dark:border-stone-700"
            >
              <option value="0.75" className="dark:bg-stone-900">
                0.75×
              </option>
              <option value="1" className="dark:bg-stone-900">
                1×
              </option>
              <option value="1.25" className="dark:bg-stone-900">
                1.25×
              </option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">{labels.difficulty}</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-1.5 dark:border-stone-700"
            >
              <option value="beginner" className="dark:bg-stone-900">
                {labels.beginner}
              </option>
              <option value="intermediate" className="dark:bg-stone-900">
                {labels.intermediate}
              </option>
              <option value="master" className="dark:bg-stone-900">
                {labels.master}
              </option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">{labels.voiceInput}</span>
            <select
              value={voiceMode}
              onChange={(e) =>
                setVoiceMode(e.target.value as "continuous" | "push")
              }
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-1.5 dark:border-stone-700"
            >
              <option value="continuous" className="dark:bg-stone-900">
                {labels.continuous}
              </option>
              <option value="push" className="dark:bg-stone-900">
                {labels.push}
              </option>
            </select>
          </label>
        </div>

        <Button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-stone-950 font-bold text-white hover:bg-stone-800 dark:bg-[#c8ee63] dark:text-stone-950 cursor-pointer"
        >
          {labels.done}
        </Button>
      </div>
    </div>
  );
}
