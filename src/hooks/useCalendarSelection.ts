import { useCallback, useState } from "react";
import type { DateSelectArg } from "@fullcalendar/core";
import { parseInTimezone } from "@/utils/date-utils";

/**
 * Selection context menu state
 */
export interface SelectionContextMenu {
  show: boolean;
  x: number;
  y: number;
  type: "selection";
  startDate?: Date;
  endDate?: Date;
}

/**
 * Hook for managing calendar time selection and selection context menu
 */
export function useCalendarSelection() {
  const [selectionContextMenu, setSelectionContextMenu] = useState<SelectionContextMenu>({
    show: false,
    x: 0,
    y: 0,
    type: "selection",
  });

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (!selectInfo.start || !selectInfo.end) return;

    // Get the center of the selected time range for menu positioning
    const jsEvent = selectInfo.jsEvent as MouseEvent | TouchEvent;
    let x: number, y: number;

    if (jsEvent instanceof MouseEvent) {
      x = jsEvent.clientX;
      y = jsEvent.clientY;
    } else if (jsEvent instanceof TouchEvent && jsEvent.touches.length > 0) {
      x = jsEvent.touches[0].clientX;
      y = jsEvent.touches[0].clientY;
    } else {
      // Fallback to center of viewport if event details unavailable
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }

    const startMoment = parseInTimezone(selectInfo.startStr);
    const endMoment = parseInTimezone(selectInfo.endStr);

    setSelectionContextMenu({
      show: true,
      x,
      y,
      type: "selection",
      startDate: startMoment.toDate(),
      endDate: endMoment.toDate(),
    });
  }, []);

  const hideSelectionContextMenu = useCallback(() => {
    setSelectionContextMenu({ show: false, x: 0, y: 0, type: "selection" });
  }, []);

  return {
    selectionContextMenu,
    handleDateSelect,
    hideSelectionContextMenu,
  };
}
