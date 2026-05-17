import { useCallback, useEffect, useRef, useState } from "react";
import { deleteEvent as apiDeleteEvent, updateEvent as apiUpdateEvent, fetchEvents } from "@/api/calendar";
import { getLastMutationTime } from "@/api/client";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import type { CalendarEvent, EventType } from "@/types/calendar";
import type { WebSocketMessage } from "@/lib/websocket-provider";
import { getWeekCacheKey, getWeekStart } from "@/utils/calendar-utils";
import { isAbortError } from "@/utils/error-utils";

const VALID_EVENT_TYPES: EventType[] = ["standard", "break", "marker"];

/**
 * Normalizes API event_type values to lowercase and drops unknown values.
 * This keeps downstream marker/break checks consistent even when the API
 * returns uppercase variants such as "MARKER".
 */
function normalizeCalendarEvent(event: CalendarEvent): CalendarEvent {
  const normalizedEventType = event.event_type?.toLowerCase();
  const eventType: EventType | undefined =
    normalizedEventType && VALID_EVENT_TYPES.includes(normalizedEventType as EventType) ? (normalizedEventType as EventType) : undefined;

  return {
    ...event,
    event_type: eventType,
  };
}

/**
 * Hook for managing calendar events with caching, debouncing, and WebSocket updates
 *
 * Features:
 * - Caches events by week to reduce API calls
 * - Debounces refetch requests (30 second minimum interval)
 * - Integrates with WebSocket for real-time updates
 * - Provides updateEvents function for optimistic updates
 * - Automatically fetches tickets for projects found in events
 */
export function useCalendarEvents(selectedDate: Date, fetchTicketsForProject?: (projectId: string, signal?: AbortSignal) => Promise<boolean>) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsCache, setEventsCache] = useState<Map<string, CalendarEvent[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Latest-ref: always reflects the current events array without adding it as
  // a dependency to every useCallback that needs to read it.
  const eventsRef = useRef<CalendarEvent[]>([]);
  eventsRef.current = events;

  // Latest-ref access for cache/callback avoids adding them to the fetch effect
  // deps, which would otherwise retrigger loads on every cache write or callback
  // identity change.
  const eventsCacheRef = useRef(eventsCache);
  eventsCacheRef.current = eventsCache;
  const fetchTicketsForProjectRef = useRef(fetchTicketsForProject);
  fetchTicketsForProjectRef.current = fetchTicketsForProject;

  // WebSocket integration - will need migration later
  const { lastMessage } = useWebSocketMessages((message) => {
    console.log("WebSocket message received:", message);
  });

  // Debouncing state
  const [debouncedTrigger, setDebouncedTrigger] = useState(0);
  const [isWebSocketUpdate, setIsWebSocketUpdate] = useState(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a reference to the last WS message we processed so we can detect when
  // a *new* message arrives (vs. the effect re-running due to selectedDate changing).
  const prevLastMessageRef = useRef<WebSocketMessage | null>(null);

  // Track which projects have had their tickets fetched to avoid duplicate calls
  const fetchedProjectsRef = useRef<Set<string>>(new Set());

  // Handle WebSocket updates and date changes with debouncing
  useEffect(() => {
    const now = Date.now();

    // Detect whether this effect run was triggered by a new WS message.
    const isNewWSMessage = lastMessage !== null && lastMessage !== prevLastMessageRef.current;
    prevLastMessageRef.current = lastMessage;

    if (isNewWSMessage) {
      // Extract backend event time from the WS payload sent by the backend.
      // If the FE made a mutating API call more recently than the backend received
      // this event, the message is stale and should be ignored to prevent the
      // optimistic UI from rolling back to an intermediate server state.
      //
      // The backend sends received_time as either an ISO-8601 string or a Unix
      // timestamp (ms).  We intentionally cast via `unknown` so TypeScript
      // reminds us that the shape is not guaranteed at compile time.
      const messageData = (lastMessage.data as unknown) as Record<string, unknown> | null | undefined;
      const payload = (messageData?.payload as Record<string, unknown> | undefined) ?? undefined;
      const receivedTime = messageData?.received_time ?? messageData?.time ?? payload?.received_time ?? payload?.time;

      if (receivedTime !== undefined) {
        const receivedTimestamp =
          typeof receivedTime === "string"
            ? new Date(receivedTime).getTime()
            : typeof receivedTime === "number"
              ? receivedTime < 1_000_000_000_000
                ? receivedTime * 1000
                : receivedTime
              : NaN;

        // Only apply the staleness check when we have a valid numeric timestamp.
        // An invalid/unparseable value falls through so we never silently discard messages.
        if (!Number.isNaN(receivedTimestamp)) {
          const lastChangeTime = getLastMutationTime();

          if (lastChangeTime > receivedTimestamp) {
            console.log(
              "Ignoring stale WS message: FE last change at",
              lastChangeTime,
              "is newer than WS received_time",
              receivedTimestamp,
            );
            return;
          }
        }
      }
    }

    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const DEBOUNCE_DELAY = 30000; // 30 seconds

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if this is a WebSocket update (a new, non-stale message arrived)
    const isWSUpdate = isNewWSMessage;
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

        let items: CalendarEvent[] = [];

        // Check cache first, unless this is a WebSocket update
        if (!isWebSocketUpdate && eventsCacheRef.current.has(weekKey)) {
          console.log("Using cached events for week:", weekKey);
          const cachedEvents = eventsCacheRef.current.get(weekKey) || [];
          setEvents(cachedEvents);
          items = cachedEvents;
        } else {
          console.debug("Fetching events from API for week:", startDate, "to", endDate);
          const data = await fetchEvents(startDate, endDate, ac.signal);
          items = (data.events || []).map(normalizeCalendarEvent);
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
        }

        // TODO: Implement a batch project ticket fetcher
        // Fetch tickets for any projects that haven't been fetched yet
        // This runs for both cached and newly fetched events
        const fetchTicketsForProjectFn = fetchTicketsForProjectRef.current;
        if (fetchTicketsForProjectFn) {
          // Extract unique project IDs from events
          const projectIds = new Set<string>();
          for (const event of items) {
            if (event.project_id && !fetchedProjectsRef.current.has(event.project_id)) {
              projectIds.add(event.project_id);
            }
          }

          // Fetch tickets for each project (only once per project)
          if (projectIds.size > 0) {
            console.debug(`Fetching tickets for ${projectIds.size} projects:`, Array.from(projectIds));

            // Fetch all projects in parallel
            const fetchPromises = Array.from(projectIds).map(async (projectId) => {
              try {
                const fetched = await fetchTicketsForProjectFn(projectId, ac.signal);
                if (fetched) {
                  fetchedProjectsRef.current.add(projectId);
                  console.debug(`Successfully fetched tickets for project: ${projectId}`);
                }
              } catch (err: unknown) {
                if (!isAbortError(err)) {
                  console.error(`Failed to fetch tickets for project ${projectId}:`, err);
                }
              }
            });

            // Wait for all ticket fetches to complete (but don't block event rendering)
            Promise.all(fetchPromises).catch(() => {
              // Errors already logged above
            });
          }
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
  }, [debouncedTrigger, selectedDate, isWebSocketUpdate]);

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
    async (eventId: string, updates: Partial<CalendarEvent> & { date?: string; calendar_id?: string }) => {
      try {
        // Detect markers from the latest events state.
        // Marker events only accept { date } (start date only); they must never
        // receive { start_date, end_date } which is the regular-event shape.
        const calEvent = eventsRef.current.find((e) => e.google_id === eventId);
        const isMarker = calEvent?.event_type === "marker";

        if (isMarker) {
          const date = updates.date || updates.start_date;
          if (!date) {
            console.warn(`updateEvent: marker ${eventId} received no date — skipping API call`);
            return;
          }
          await apiUpdateEvent(eventId, { date });
          updateEvents((prevEvents) =>
            prevEvents.map((event) => (event.google_id === eventId ? { ...event, start_date: date, end_date: date } : event)),
          );
        } else {
          await apiUpdateEvent(eventId, updates);
          const { date, calendar_id: _calendarId, ...eventUpdates } = updates;
          updateEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.google_id === eventId
                ? {
                    ...event,
                    ...eventUpdates,
                    ...(date ? { start_date: date, end_date: date } : {}),
                  }
                : event,
            ),
          );
        }
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

        if (!event) {
          console.warn("Event not found for deletion:", eventId);
          return;
        }

        // Break and marker events don't require calendar_id, regular events do
        if (!event.is_break && event.event_type !== "break" && event.event_type !== "marker" && !event.google_calendar_id) {
          console.warn("Calendar ID not found for non-break/marker event deletion:", eventId);
          return;
        }

        // Optimistically remove from local state first
        const previousEvents = events;
        updateEvents((prevEvents) => prevEvents.filter((e) => e.google_id !== eventId));

        try {
          // For break events, calendar_id can be empty string
          await apiDeleteEvent(event.google_id as string, event.google_calendar_id || "");
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
