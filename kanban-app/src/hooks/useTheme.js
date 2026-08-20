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

/**
 * Light is the fixed default regardless of OS preference. `explicitTheme`
 * is null until the user picks dark via the toggle; that choice persists
 * and is the only thing that switches the theme away from light.
 */
export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (explicitTheme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }, [explicitTheme]);

  function toggleTheme() {
    setExplicitTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore write failures (private browsing, storage disabled, etc.)
      }
      return next;
    });
  }

  return { theme: explicitTheme === "dark" ? "dark" : "light", toggleTheme };
}
