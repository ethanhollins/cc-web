/**
 * Shared utility functions for calendar components
 */

/**
 * Calculate which week of the month a date falls into
 */
export function weekOfMonth(d: Date): number {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const monday0 = (first.getDay() + 6) % 7;
  return Math.floor((d.getDate() + monday0 - 1) / 7) + 1;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday is 0
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startMonth = weekStart.toLocaleString("en-US", { month: "short" });
  const endMonth = weekEnd.toLocaleString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  } else {
    return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }
}

/**
 * Calculate the appropriate scroll time for calendar (current time minus 1 hour, minimum 00:00:00)
 */
export function calculateScrollTime(now: Date = new Date()): string {
  const currentHour = now.getHours();
  const scrollHour = Math.max(0, currentHour - 1);
  return `${scrollHour.toString().padStart(2, "0")}:00:00`;
}

/**
 * Function to lighten a hex color by mixing with white
 */
export function lightenColor(hex: string, amount: number = 0.8): string {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Lighten by mixing with white
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Get the cache key for a week (uses week start ISO string)
 */
export function getWeekCacheKey(date: Date): string {
  const weekStart = getWeekStart(date);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
}

/**
 * Calculate event duration in minutes
 */
export function calculateEventDuration(start: Date | null, end: Date | null): number {
  if (!start || !end) return 60; // Default 60 minutes
  return (end.getTime() - start.getTime()) / (1000 * 60);
}

/**
 * Check if an event is considered "short" (less than 30 minutes)
 */
export function isShortEvent(start: Date | null, end: Date | null): boolean {
  return calculateEventDuration(start, end) < 30;
}
