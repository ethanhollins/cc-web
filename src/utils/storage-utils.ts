/**
 * Cookie and storage utilities for persisting user preferences
 */
import Cookies from "js-cookie";

/**
 * Save focus filter preferences
 */
export function saveFocusFilterPreferences(focusIds: string[]): void {
  Cookies.set("calendar-focus-filter", JSON.stringify(focusIds), {
    expires: 365, // 1 year
    sameSite: "lax",
  });
}

/**
 * Load focus filter preferences
 */
export function loadFocusFilterPreferences(): string[] {
  const value = Cookies.get("calendar-focus-filter");
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clear focus filter preferences
 */
export function clearFocusFilterPreferences(): void {
  Cookies.remove("calendar-focus-filter");
}
