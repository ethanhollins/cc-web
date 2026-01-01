import { type RefObject, useCallback, useState } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";

/**
 * Hook for managing calendar date state and navigation
 */
export function useCalendarDate(calendarRef: RefObject<FullCalendar | null>, initialDate?: Date, onDateChange?: (date: Date) => void) {
  const [selectedDate, setSelectedDate] = useState(() => initialDate || new Date());

  const updateDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      onDateChange?.(date);
    },
    [onDateChange],
  );

  const goToPreviousPeriod = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      const newDate = api.getDate();
      if (newDate) {
        updateDate(new Date(newDate));
      }
    }
  }, [calendarRef, updateDate]);

  const goToNextPeriod = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      const newDate = api.getDate();
      if (newDate) {
        updateDate(new Date(newDate));
      }
    }
  }, [calendarRef, updateDate]);

  const goToToday = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      updateDate(new Date());
    }
  }, [calendarRef, updateDate]);

  const handleDatesSet = useCallback(
    (dateInfo: DatesSetArg) => {
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
