"use client";

export type ThemeMode = "auto" | "light" | "dark";

const STORAGE_KEY = "theme";
const CYCLE: ThemeMode[] = ["auto", "light", "dark"];

export const THEME_LABELS: Record<ThemeMode, string> = {
  auto: "auto",
  light: "light",
  dark: "dark",
};

function apply(mode: ThemeMode): void {
  if (mode === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }
  localStorage.setItem(STORAGE_KEY, mode);
}

/** Reads stored preference, applies it, and returns the active mode. */
export function initTheme(): ThemeMode {
  const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? "auto";
  apply(stored);
  return stored;
}

/** Returns the active --primary CSS variable value, falling back to the dark-mode default. */
export function getPrimaryColor(): string {
  if (typeof document === "undefined") return "#facc15";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#facc15"
  );
}

/** Advances to the next mode, applies it, and returns the new mode. */
export function toggleTheme(current: ThemeMode): ThemeMode {
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
  apply(next);
  return next;
}
