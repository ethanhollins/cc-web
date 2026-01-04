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
 * Get formatted week range title from a date
 */
export function getWeekRangeTitle(date: Date): string {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  return formatWeekRange(weekStart, weekEnd);
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

/**
 * Internal helper to sort all timegrid event harnesses within a column
 * container so that earlier events (visually higher up) end up later
 * in the DOM tree. This causes them to render on top when elements
 * share the same z-index.
 *
 * NOTE: This relies on FullCalendar's current timegrid DOM structure
 * (".fc-timegrid-event-harness" inside ".fc-timegrid-col-events"). If
 * FullCalendar is upgraded, re-verify these selectors still exist.
 */
function sortTimegridHarnessesInContainer(eventsContainer: HTMLElement): void {
  const harnesses = Array.from(eventsContainer.querySelectorAll<HTMLElement>(".fc-timegrid-event-harness"));

  harnesses
    // Use offsetTop (distance from the container's top) as the vertical
    // position; larger offsetTop = lower on the screen. We sort descending
    // so earlier events (smaller offsetTop) are appended last and thus sit
    // visually on top.
    .sort((a, b) => b.offsetTop - a.offsetTop)
    .forEach((el) => {
      eventsContainer.appendChild(el);
    });
}

/**
 * Re-order timegrid event harnesses within the current column so that
 * earlier events (visually higher up) end up later in the DOM tree.
 * This makes earlier events render on top when elements share the same
 * z-index, without relying on z-index tweaks.
 */
export function reorderTimegridColumnEventsForElement(eventElement: HTMLElement): void {
  const harness = eventElement.closest(".fc-timegrid-event-harness") as HTMLElement | null;
  const eventsContainer = harness?.closest(".fc-timegrid-col-events") as HTMLElement | null;

  if (!harness || !eventsContainer) return;

  // Perform an immediate sort for the current state.
  sortTimegridHarnessesInContainer(eventsContainer);

  // Attach a MutationObserver once per column container so that any future
  // DOM changes FullCalendar makes (for example, when events are updated
  // or re-rendered) will automatically re-apply our sorting. This prevents
  // internal updates from "undoing" the desired stacking order.
  if (eventsContainer.dataset.ccHarnessObserverAttached === "true") {
    return;
  }

  const observer = new MutationObserver(() => {
    // Avoid infinite loops by disconnecting while we perform our own
    // DOM mutations, then re-attaching afterwards.
    observer.disconnect();
    sortTimegridHarnessesInContainer(eventsContainer);
    observer.observe(eventsContainer, { childList: true });
  });

  observer.observe(eventsContainer, { childList: true });
  eventsContainer.dataset.ccHarnessObserverAttached = "true";
}
