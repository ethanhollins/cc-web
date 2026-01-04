import { useCallback, useEffect, useRef, useState } from "react";
import { deleteEvent as apiDeleteEvent, updateEvent as apiUpdateEvent, fetchEvents } from "@/api/calendar";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import type { CalendarEvent } from "@/types/calendar";
import { getWeekCacheKey, getWeekStart } from "@/utils/calendar-utils";
import { isAbortError } from "@/utils/error-utils";
import { attachMockYieldsAndScore } from "@/utils/ticket-yields";

/**
 * Hook for managing calendar events with caching, debouncing, and WebSocket updates
 *
 * Features:
 * - Caches events by week to reduce API calls
 * - Debounces refetch requests (30 second minimum interval)
 * - Integrates with WebSocket for real-time updates
 * - Provides updateEvents function for optimistic updates
 */
export function useCalendarEvents(selectedDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsCache, setEventsCache] = useState<Map<string, CalendarEvent[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // WebSocket integration - will need migration later
  const { lastMessage } = useWebSocketMessages((message) => {
    console.log("WebSocket message received:", message);
  });

  // Debouncing state
  const [debouncedTrigger, setDebouncedTrigger] = useState(0);
  const [isWebSocketUpdate, setIsWebSocketUpdate] = useState(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle WebSocket updates and date changes with debouncing
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const DEBOUNCE_DELAY = 30000; // 30 seconds

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if this is a WebSocket update (lastMessage changed)
    const isWSUpdate = lastMessage !== null;
    setIsWebSocketUpdate(isWSUpdate);

    if (timeSinceLastUpdate >= DEBOUNCE_DELAY) {
      // Enough time has passed, trigger update immediately
      lastUpdateTimeRef.current = now;
      setDebouncedTrigger((prev) => prev + 1);
    } else {
      // Not enough time has passed, schedule update for later
      const remainingTime = DEBOUNCE_DELAY - timeSinceLastUpdate;
      debounceTimeoutRef.current = setTimeout(() => {
        lastUpdateTimeRef.current = Date.now();
        setDebouncedTrigger((prev) => prev + 1);
      }, remainingTime);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [selectedDate, lastMessage]);

  // Fetch events with caching logic
  useEffect(() => {
    // TODO: Implement events fetching with caching
    // 1. Create AbortController
    // 2. Define async loadEvents function:
    //    - Calculate weekStart using getWeekStart(selectedDate)
    //    - Set hours to 0,0,0,0 for start of day
    //    - Calculate weekEnd: new Date(weekStart), add 7 days
    //    - Convert to ISO strings: startDate, endDate
    //    - Generate cache key: getWeekCacheKey(selectedDate)
    //    - Check cache first (unless isWebSocketUpdate):
    //      * If cached, set events from cache and return
    //    - If not cached or WebSocket update:
    //      * Call fetchEvents(startDate, endDate, ac.signal)
    //      * Extract events array from response
    //      * Update cache: setEventsCache with new Map
    //      * Update events state
    //      * Reset isWebSocketUpdate flag
    //    - Handle errors (ignore AbortError, log others)
    // 3. Call loadEvents()
    // 4. Return cleanup: () => ac.abort()
    // NOTE: See /src/old/hooks/use-calendar-events.ts lines 61-124
    const ac = new AbortController();

    const loadEvents = async () => {
      setIsLoading(true);
      try {
        console.debug("Selected date for events fetch:", selectedDate);

        // Get the start of the week (Monday) that contains the selected date
        const weekStart = getWeekStart(selectedDate);
        weekStart.setHours(0, 0, 0, 0);

        // Get the end of the fetch window
        // NOTE: We fetch one extra day beyond the current week so that
        // mobile 3-day views that cross a week boundary (e.g. Sat–Sun–Mon)
        // still have events loaded for the visible days.
        const fetchEnd = new Date(weekStart);
        fetchEnd.setDate(weekStart.getDate() + 8); // Monday (7 days) + 1 extra day
        fetchEnd.setHours(0, 0, 0, 0);

        console.debug("Week Start:", weekStart, "Fetch End:", fetchEnd);

        const startDate = weekStart.toISOString();
        const endDate = fetchEnd.toISOString();
        const weekKey = getWeekCacheKey(selectedDate);

        // Check cache first, unless this is a WebSocket update
        if (!isWebSocketUpdate && eventsCache.has(weekKey)) {
          console.log("Using cached events for week:", weekKey);
          const cachedEvents = eventsCache.get(weekKey) || [];
          setEvents(cachedEvents);
          return;
        }

        console.debug("Fetching events from API for week:", startDate, "to", endDate);
        const data = await fetchEvents(startDate, endDate, ac.signal);
        const items: CalendarEvent[] = (data.events || []).map((event) => attachMockYieldsAndScore(event));
        console.debug("Events fetched from API:", items);

        // Update cache and state
        setEventsCache((prevCache) => {
          const newCache = new Map(prevCache);
          newCache.set(weekKey, items);
          return newCache;
        });
        setEvents(items);

        // Reset WebSocket update flag after processing
        if (isWebSocketUpdate) {
          setIsWebSocketUpdate(false);
        }
      } catch (err: unknown) {
        if (isAbortError(err)) {
          console.warn("Events fetch canceled:", err);
          return;
        }
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
    return () => ac.abort();
  }, [debouncedTrigger, selectedDate, isWebSocketUpdate, eventsCache]);

  // Optimistic updates function - memoized to prevent re-renders during drag
  const updateEvents = useCallback(
    (updater: (prevEvents: CalendarEvent[]) => CalendarEvent[]) => {
      setEvents(updater);

      // Also update the cache
      const weekKey = getWeekCacheKey(selectedDate);
      setEventsCache((prevCache) => {
        const newCache = new Map(prevCache);
        const currentEvents = newCache.get(weekKey) || [];
        newCache.set(weekKey, updater(currentEvents));
        return newCache;
      });
    },
    [selectedDate],
  );

  // Update event API call
  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEvent>) => {
      try {
        await apiUpdateEvent(eventId, updates);
        // Optimistically update local state
        updateEvents((prevEvents) => prevEvents.map((event) => (event.google_id === eventId ? { ...event, ...updates } : event)));
      } catch (error) {
        console.error("Failed to update event:", error);
        throw error;
      }
    },
    [updateEvents],
  );

  // Delete event API call
  const deleteEvent = useCallback(
    async (eventId: string) => {
      try {
        const event = events.find((e) => e.google_id === eventId);

        if (!event || !event.google_calendar_id) {
          console.warn("Event or calendar ID not found for deletion:", eventId);
          return;
        }
        // Optimistically remove from local state first
        const previousEvents = events;
        updateEvents((prevEvents) => prevEvents.filter((e) => e.google_id !== eventId));

        try {
          await apiDeleteEvent(event.google_id as string, event.google_calendar_id);
        } catch (apiError) {
          console.error("Failed to delete event on server, reverting local delete:", apiError);
          // Revert optimistic delete on failure
          setEvents(previousEvents);
          throw apiError;
        }
      } catch (error) {
        console.error("Failed to delete event:", error);
        throw error;
      }
    },
    [events, updateEvents],
  );

  // Force refetch
  const refetch = useCallback(() => {
    setDebouncedTrigger((prev) => prev + 1);
    lastUpdateTimeRef.current = Date.now();
  }, []);

  return {
    events,
    isLoading,
    updateEvents,
    updateEvent,
    deleteEvent,
    refetch,
    eventsCache,
  };
}
