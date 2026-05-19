"use client";

import type { ThemeMode } from "@/lib/types";
import { STORAGE_KEY, CYCLE } from "@/lib/constants/theme";

function apply(mode: ThemeMode): void {
  if (mode === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }
  localStorage.setItem(STORAGE_KEY, mode);
}

export function initTheme(): ThemeMode {
  const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? "auto";
  apply(stored);
  return stored;
}

export function getPrimaryColor(): string {
  if (typeof document === "undefined") return "#facc15";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#facc15"
  );
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
  apply(next);
  return next;
}
