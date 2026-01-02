"use client";

import { useEffect, useState } from "react";

/**
 * usePlannerTheme
 *
 * CC-48: Soft Light/Dark Theming for Planner
 *
 * This hook manages the current theme for the planner experience. It is
 * intentionally scoped to the planner for now but can be generalised
 * later if a global theming system is introduced.
 */

export type PlannerThemeName = "soft-light" | "soft-dark";

export interface UsePlannerThemeResult {
  /** The currently selected planner theme. */
  theme: PlannerThemeName;
  /**
   * Convenience class name to apply to the planner layout root.
   *
   * Example usage:
   *   const { containerClass } = usePlannerTheme();
   *   return <div className={cn(containerClass, "h-full")}>
   *     ...
   *   </div>
   */
  containerClass: string;
  /** Setter for switching between themes. */
  setTheme: (theme: PlannerThemeName) => void;
}

const STORAGE_KEY = "plannerTheme";

function getInitialTheme(): PlannerThemeName {
  if (typeof window === "undefined") {
    return "soft-light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "soft-light" || stored === "soft-dark") {
    return stored;
  }

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "soft-dark";
  }

  return "soft-light";
}

export function usePlannerTheme(): UsePlannerThemeResult {
  // IMPORTANT: Always start from a stable default so the first
  // server render matches the first client render. We then
  // hydrate to the real theme preference in an effect.
  const [theme, setTheme] = useState<PlannerThemeName>("soft-light");

  // On mount, determine the actual preferred theme using
  // browser APIs (localStorage / matchMedia) and update.
  useEffect(() => {
    const initial = getInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
  }, []);

  // Persist theme to localStorage whenever it changes in the browser.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Also apply the theme class to document.body so elements created
  // outside the planner layout tree (e.g. drag mirrors) still receive
  // the same CSS custom properties and visual styling.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;
    const nextClass = theme === "soft-light" ? "theme-soft-light" : "theme-soft-dark";

    body.classList.remove("theme-soft-light", "theme-soft-dark");
    body.classList.add(nextClass);

    return () => {
      body.classList.remove("theme-soft-light", "theme-soft-dark");
    };
  }, [theme]);

  const containerClass = theme === "soft-light" ? "theme-soft-light" : "theme-soft-dark";

  return { theme, setTheme, containerClass };
}
