import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Context menu state interface
 */
export interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  type: "event";
  eventId?: string;
  googleCalendarId?: string;
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
    (x: number, y: number, eventId?: string, googleCalendarId?: string) => {
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
      });
    },
    [isDragging],
  );

  // Auto-hide context menu when dragging starts
  useEffect(() => {
    if (isDragging && contextMenu.show) {
      setContextMenu((prev) => ({ ...prev, show: false }));
    }
  }, [isDragging, contextMenu.show]);

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
    (e: React.TouchEvent, eventId?: string, onContextMenu?: (x: number, y: number) => void, onHideContextMenu?: () => void) => {
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
        console.log("Event editing enabled for:", eventId);
      }, 1000);
    },
    [editableEventId],
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
 * Hook for managing calendar date state and navigation
 */
export function useCalendarDate(initialDate?: Date, onDateChange?: (date: Date) => void) {
  const [selectedDate, setSelectedDate] = useState(() => initialDate || new Date());

  const updateDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      onDateChange?.(date);
    },
    [onDateChange],
  );

  const goToPreviousPeriod = useCallback(
    (calendarApi: any) => {
      calendarApi?.prev();
      const newDate = calendarApi?.getDate();
      if (newDate) {
        updateDate(new Date(newDate));
      }
    },
    [updateDate],
  );

  const goToNextPeriod = useCallback(
    (calendarApi: any) => {
      calendarApi?.next();
      const newDate = calendarApi?.getDate();
      if (newDate) {
        updateDate(new Date(newDate));
      }
    },
    [updateDate],
  );

  const goToToday = useCallback(
    (calendarApi: any) => {
      calendarApi?.today();
      updateDate(new Date());
    },
    [updateDate],
  );

  const handleDatesSet = useCallback(
    (dateInfo: any) => {
      const newDate = new Date(dateInfo.start);
      updateDate(newDate);
    },
    [updateDate],
  );

  return {
    selectedDate,
    updateDate,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    handleDatesSet,
  };
}

/**
 * Hook for managing calendar outside clicks and unselecting
 */
export function useCalendarOutsideClick(containerRef: React.RefObject<HTMLElement>, calendarRef: React.RefObject<any>, onOutsideClick?: () => void) {
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
