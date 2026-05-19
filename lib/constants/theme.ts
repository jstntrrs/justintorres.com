import type { ThemeMode } from "@/lib/types";

export const STORAGE_KEY = "theme";
export const CYCLE: ThemeMode[] = ["auto", "light", "dark"];

export const THEME_LABELS: Record<ThemeMode, string> = {
  auto: "auto",
  light: "light",
  dark: "dark",
};
