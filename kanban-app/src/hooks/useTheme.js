import { useEffect, useState } from "react";

const STORAGE_KEY = "kanban-board:theme";

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * `explicitTheme` is null until the user picks one via the toggle, meaning
 * "follow the OS setting" (handled in CSS via prefers-color-scheme). Once
 * they toggle, that choice is explicit and persisted, overriding the OS
 * setting from then on.
 */
export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (explicitTheme) root.setAttribute("data-theme", explicitTheme);
    else root.removeAttribute("data-theme");
  }, [explicitTheme]);

  function toggleTheme() {
    setExplicitTheme((current) => {
      const isDark = current === "dark" || (!current && systemPrefersDark());
      const next = isDark ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore write failures (private browsing, storage disabled, etc.)
      }
      return next;
    });
  }

  const resolvedTheme = explicitTheme ?? (systemPrefersDark() ? "dark" : "light");

  return { theme: resolvedTheme, toggleTheme };
}
