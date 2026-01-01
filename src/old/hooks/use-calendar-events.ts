import { useEffect, useRef, useState } from "react";
import { TicketEvent } from "@/old/app/home-screen";
import { API_BASE_URL } from "@/old/config/api";
import { useWebSocketMessages } from "@/old/hooks/use-websocket";
import { getWeekCacheKey, getWeekStart } from "@/old/utils/calendar-utils";

/**
 * Hook for managing calendar events with caching, debouncing, and WebSocket updates
 */
export function useCalendarEvents(selectedDate: Date) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [eventsCache, setEventsCache] = useState<Map<string, TicketEvent[]>>(new Map());

  // WebSocket integration
  const { lastMessage } = useWebSocketMessages((message) => {
    console.log("WebSocket message received:", message);
  });

  // Debounced trigger for events refetch (30 second minimum interval)
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
    const ac = new AbortController();

    const fetchEvents = async () => {
      try {
        console.log("Selected date for events fetch:", selectedDate);

        // Get the start of the week (Monday) that contains the selected date
        const weekStart = getWeekStart(selectedDate);
        weekStart.setHours(0, 0, 0, 0);

        // Get the end of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        weekEnd.setHours(0, 0, 0, 0);

        console.log("Week Start:", weekStart, "Week End:", weekEnd);

        const startDate = weekStart.toISOString();
        const endDate = weekEnd.toISOString();
        const weekKey = getWeekCacheKey(selectedDate);

        // Check cache first, unless this is a WebSocket update
        if (!isWebSocketUpdate && eventsCache.has(weekKey)) {
          console.log("Using cached events for week:", weekKey);
          const cachedEvents = eventsCache.get(weekKey) || [];
          setEvents(cachedEvents);
          return;
        }

        console.log("Fetching events from API for week:", startDate, "to", endDate);
        const url = `${API_BASE_URL}/events?start_date=${startDate}&end_date=${endDate}`;

        const res = await fetch(url, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
        const json = await res.json();
        const items = json.events || [];
        console.log("Events fetched from API:", items);

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
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
    return () => ac.abort();
  }, [debouncedTrigger, selectedDate, isWebSocketUpdate, eventsCache]);

  // Function to manually update events (for optimistic updates)
  const updateEvents = (updater: (prevEvents: TicketEvent[]) => TicketEvent[]) => {
    setEvents(updater);

    // Also update the cache
    const weekKey = getWeekCacheKey(selectedDate);
    setEventsCache((prevCache) => {
      const newCache = new Map(prevCache);
      const currentEvents = newCache.get(weekKey) || [];
      newCache.set(weekKey, updater(currentEvents));
      return newCache;
    });
  };

  return {
    events,
    updateEvents,
    eventsCache,
  };
}
