import { useCallback, useEffect, useRef, useState } from "react";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { DropArg, EventReceiveArg } from "@fullcalendar/interaction";
import moment from "moment-timezone";
import type { CalendarResizeArg } from "@/types/calendar";
import { toTimezone } from "@/utils/date-utils";

/**
 * Calendar interaction hooks for drag/drop, context menu, and touch interactions
 */

// Context menu state interface
export interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  type: "event";
  eventId?: string;
  googleCalendarId?: string;
  is_break?: boolean;
}

/**
 * Hook for managing event drag and resize state
 */
export function useEventDragState() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleResizeStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleDragStart,
    handleDragStop,
    handleResizeStart,
    handleResizeStop,
  };
}

/**
 * Hook for managing calendar context menu state and interactions
 */
export function useCalendarContextMenu(isDragging?: boolean) {
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    show: false,
    x: 0,
    y: 0,
    type: "event",
  });

  const showContextMenu = useCallback(
    (x: number, y: number, eventId?: string, googleCalendarId?: string, is_break?: boolean) => {
      // Don't show context menu if an event is being dragged
      if (isDragging) {
        return;
      }

      setContextMenu({
        show: true,
        x,
        y,
        type: "event",
        eventId,
        googleCalendarId,
        is_break,
      });
    },
    [isDragging],
  );
  const hideContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, show: false }));
  }, []);

  // Handle clicks outside to hide context menu
  useEffect(() => {
    const handleClick = () => hideContextMenu();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [hideContextMenu]);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
}

/**
 * Hook for managing long press interactions on touch devices
 */
export function useLongPress(isDragging?: boolean) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [editableEventId, setEditableEventId] = useState<string | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const editingLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const onHideContextMenuRef = useRef<(() => void) | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent, eventId?: string, onContextMenu?: (x: number, y: number) => void, onHideContextMenu?: () => void) => {
      setIsLongPressing(false);
      onHideContextMenuRef.current = onHideContextMenu || null;

      // Don't start timers if dragging or if this event is already in editing mode
      if (isDragging || editableEventId === eventId) {
        return;
      }

      // Context menu timer (500ms)
      longPressTimer.current = setTimeout(() => {
        // Don't show context menu if dragging or event is in editing mode
        if (!isDragging && editableEventId !== eventId) {
          setIsLongPressing(true);
          const touch = e.touches[0];
          onContextMenu?.(touch.clientX, touch.clientY);
        }
      }, 500);

      // Event editing timer (1000ms - twice as long)
      editingLongPressTimer.current = setTimeout(() => {
        // Hide context menu before entering edit mode
        onHideContextMenuRef.current?.();
        setEditableEventId(eventId || null);
        console.debug("Event editing enabled for:", eventId);
      }, 1000);
    },
    [isDragging, editableEventId],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (editingLongPressTimer.current) {
      clearTimeout(editingLongPressTimer.current);
      editingLongPressTimer.current = null;
    }
    setTimeout(() => setIsLongPressing(false), 100);
  }, []);

  const clearEditableEvent = useCallback(() => {
    setEditableEventId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (editingLongPressTimer.current) clearTimeout(editingLongPressTimer.current);
    };
  }, []);

  return {
    isLongPressing,
    editableEventId,
    handleTouchStart,
    handleTouchEnd,
    clearEditableEvent,
  };
}

/**
 * Hook for managing calendar outside clicks and unselecting
 */
export function useCalendarOutsideClick(
  containerRef: React.RefObject<HTMLElement>,
  calendarRef: React.RefObject<{ getApi: () => { unselect: () => void } } | null>,
  onOutsideClick?: () => void,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const api = calendarRef.current?.getApi();
        api?.unselect();
        onOutsideClick?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [containerRef, calendarRef, onOutsideClick]);
}

/**
 * Unified hook combining all calendar interaction hooks
 * Provides a clean interface for event clicks, drag/drop, resize, and context menu
 */
export function useCalendarInteractions({
  onEventUpdate,
  onEventDelete,
  onEventCreate,
}: {
  onEventUpdate?: (eventId: string, updates: { start_date: string; end_date: string; calendar_id?: string }) => Promise<void>;
  onEventDelete?: (eventId: string) => Promise<void>;
  onEventCreate?: (eventData: {
    calendar_id: string;
    start_date: string;
    end_date: string;
    ticket_data: { ticket_id: string; title: string };
    project_id?: string;
  }) => Promise<{ event_id: string }>;
}) {
  const eventDragState = useEventDragState();
  const { contextMenu, showContextMenu, hideContextMenu } = useCalendarContextMenu(eventDragState.isDragging);
  const longPressHandlers = useLongPress(eventDragState.isDragging);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      // Prevent default and stop propagation
      info.jsEvent.preventDefault();
      info.jsEvent.stopPropagation();

      showContextMenu(
        info.jsEvent.clientX,
        info.jsEvent.clientY,
        info.event.id,
        info.event.extendedProps?.google_calendar_id,
        info.event.extendedProps?.is_break,
      );
    },
    [showContextMenu],
  );

  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      try {
        const eventId = info.event.id;
        // Format dates in Sydney timezone (matching old implementation)
        const newStartDate = toTimezone(info.event.start?.toISOString().replace(/Z$/, "") ?? "");
        const newEndDate = toTimezone(info.event.end?.toISOString().replace(/Z$/, "") ?? "");

        const updates = {
          start_date: newStartDate,
          end_date: newEndDate,
          calendar_id: info.event.extendedProps?.google_calendar_id,
        };
        await onEventUpdate?.(eventId, updates);
      } catch (error) {
        console.error("Failed to drop event:", error);
        info.revert();
      }
    },
    [onEventUpdate],
  );

  const handleEventResize = useCallback(
    async (info: CalendarResizeArg) => {
      try {
        const eventId = info.event.id;
        // Format dates in Sydney timezone (matching old implementation)
        const newStartDate = toTimezone(info.event.start?.toISOString().replace(/Z$/, "") ?? "");
        const newEndDate = toTimezone(info.event.end?.toISOString().replace(/Z$/, "") ?? "");

        const updates = {
          start_date: newStartDate,
          end_date: newEndDate,
          calendar_id: info.event.extendedProps?.google_calendar_id,
        };
        await onEventUpdate?.(eventId, updates);
      } catch (error) {
        console.error("Failed to resize event:", error);
        info.revert();
      }
    },
    [onEventUpdate],
  );

  const handleEventReceive = useCallback(
    async (info: EventReceiveArg) => {
      // Filter out draggable tickets (they're handled by drop handler)
      if (info.draggedEl?.classList?.contains("draggable-ticket")) {
        return;
      }

      try {
        const eventId = info.event.id;
        // Format dates in Sydney timezone (matching old implementation)
        const newStartDate = toTimezone(info.event.start?.toISOString().replace(/Z$/, "") ?? "");
        const newEndDate = toTimezone(info.event.end?.toISOString().replace(/Z$/, "") ?? "");

        const updates = {
          start_date: newStartDate,
          end_date: newEndDate,
          calendar_id: info.event.extendedProps?.google_calendar_id,
        };
        await onEventUpdate?.(eventId, updates);
      } catch (error) {
        console.error("Failed to receive event:", error);
        info.revert();
      }
    },
    [onEventUpdate],
  );

  const handleDrop = useCallback(
    async (dropInfo: DropArg) => {
      // This handles external drops (tickets from sidebar)
      try {
        const ticketId = dropInfo.draggedEl?.dataset?.ticketId;
        const ticketTitle = dropInfo.draggedEl?.dataset?.title;
        const projectId = dropInfo.draggedEl?.dataset?.projectId;

        if (!ticketId || !ticketTitle) {
          console.warn("Missing ticket data in drop event");
          return;
        }

        // Format dates in Sydney timezone (matching old implementation)
        const sydneyStartDate = moment(dropInfo.dateStr).tz("Australia/Sydney").format();
        const sydneyEndDate = moment(dropInfo.dateStr).tz("Australia/Sydney").add(30, "minutes").format();

        const eventData = {
          calendar_id: "ethanjohol@gmail.com", // Default calendar ID
          start_date: sydneyStartDate,
          end_date: sydneyEndDate,
          ticket_data: {
            ticket_id: ticketId,
            title: ticketTitle,
          },
          project_id: projectId,
        };

        const result = await onEventCreate?.(eventData);
        return result;
      } catch (error) {
        console.error("Failed to create event from drop:", error);
      }
    },
    [onEventCreate],
  );

  const handleDateClick = useCallback((info: DateSelectArg) => {
    console.log("Date clicked:", info.startStr);
    // TODO: Implement date click handling (e.g., create new event)
  }, []);

  const handleContextMenuAction = useCallback(
    async (action: string, eventId?: string) => {
      if (action === "delete" && eventId) {
        try {
          await onEventDelete?.(eventId);
        } catch (error) {
          console.error("Failed to delete event:", error);
        }
      }
      hideContextMenu();
    },
    [onEventDelete, hideContextMenu],
  );

  return {
    eventDragState,
    contextMenu: {
      isOpen: contextMenu.show,
      position: { x: contextMenu.x, y: contextMenu.y },
      event: contextMenu.eventId ? { id: contextMenu.eventId } : undefined,
    },
    rawContextMenu: contextMenu,
    longPressHandlers,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    handleEventReceive,
    handleDrop,
    handleDateClick,
    handleContextMenuAction,
    closeContextMenu: hideContextMenu,
    showContextMenu,
  };
}
