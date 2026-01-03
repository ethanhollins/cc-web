"use client";

import { useCallback, useRef, useState } from "react";
import type { DateSelectArg, DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";
import moment from "moment-timezone";
import { createEvent } from "@/api/calendar";
import { scheduleTicket, unscheduleTicket } from "@/api/tickets";
import { CalendarContextMenu } from "@/components/calendar/CalendarContextMenu";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TicketModal } from "@/components/modals/TicketModal";
import { PlannerLayout } from "@/components/planner/PlannerLayout";
import { CoachesSidebar } from "@/components/planner/CoachesSidebar";
import { TicketsSidebar } from "@/components/planner/TicketsSidebar";
import { useCalendarDate } from "@/hooks/useCalendarDate";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useCalendarInteractions } from "@/hooks/useCalendarInteractions";
import { useProjects } from "@/hooks/useProjects";
import { useTickets } from "@/hooks/useTickets";
import type { CalendarEvent } from "@/types/calendar";
import type { Ticket } from "@/types/ticket";
import { transformEventsToCalendarFormat } from "@/utils/calendar-transform";
import { getWeekRangeTitle } from "@/utils/calendar-utils";

export default function StagePlannerPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // State for selected day (for filtering tickets)
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [isTodayInRange, setIsTodayInRange] = useState(true);

  // Projects and tickets
  const { projects, selectedProjectKey, selectProject } = useProjects();
  const { tickets, updateTickets } = useTickets(selectedProjectKey, projects);

  // Calendar date navigation
  const { selectedDate, goToPreviousPeriod, goToNextPeriod, goToToday, handleDatesSet } = useCalendarDate(calendarRef);

  const handleDatesSetWithToday = useCallback(
    (dateInfo: DatesSetArg) => {
      handleDatesSet(dateInfo);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(dateInfo.start);
      const end = new Date(dateInfo.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const inRange = today.getTime() >= start.getTime() && today.getTime() < end.getTime();
      setIsTodayInRange(inRange);
    },
    [handleDatesSet],
  );

  // Calendar events with caching
  const { events, isLoading: _isLoading, updateEvent, deleteEvent, updateEvents, refetch } = useCalendarEvents(selectedDate);

  // Calendar interactions (drag/drop, context menu, long press)
  const {
    eventDragState,
    contextMenu: _contextMenuState,
    longPressHandlers,
    handleEventClick: _handleEventClick,
    handleEventDrop,
    handleEventResize,
    handleEventReceive,
    handleDrop,
    handleDateClick: _handleDateClick,
    handleContextMenuAction,
    closeContextMenu,
    rawContextMenu,
    showContextMenu,
  } = useCalendarInteractions({
    onEventUpdate: async (eventId, updates) => {
      // Optimistically update events
      if (updateEvents) {
        updateEvents((prevEvents) => {
          return prevEvents.map((event) =>
            event.google_id === eventId
              ? {
                  ...event,
                  start_date: updates.start_date || event.start_date,
                  end_date: updates.end_date || event.end_date,
                }
              : event,
          );
        });
      }
      // Then update via API
      await updateEvent(eventId, updates);
    },
    onEventDelete: deleteEvent,
    onEventCreate: async (eventData) => {
      // Optimistically add the event to local state first
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: CalendarEvent = {
        google_id: tempId,
        ticket_id: eventData.ticket_data.ticket_id,
        ticket_key: "",
        ticket_type: "task", // Default to task type
        title: eventData.ticket_data.title,
        ticket_status: "In Progress", // Default status
        project_id: eventData.project_id,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        colour: "",
        epic: "",
        google_calendar_id: eventData.calendar_id,
        all_day: false,
        completed: false,
      };

      // Add optimistic event immediately
      updateEvents?.((prev) => [...prev, optimisticEvent]);

      try {
        // Create the event via API
        const result = await createEvent(eventData);

        // Replace optimistic event with real event from server
        updateEvents?.((prev) => prev.map((e) => (e.google_id === tempId ? { ...optimisticEvent, google_id: result.event_id } : e)));

        // Refetch to get complete event data with all fields
        await refetch();

        return result;
      } catch (error) {
        // Remove optimistic event on error
        updateEvents?.((prev) => prev.filter((e) => e.google_id !== tempId));
        throw error;
      }
    },
  });

  // Ticket modal state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Handle opening ticket from event click
  const handleEventClickWrapper = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.google_id === eventId);
      setSelectedTicket(event || null);
      setSelectedEventId(eventId);
    },
    [events],
  );

  const handleTicketClick = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedEventId(null); // Clear event ID when opening from ticket list
  }, []);

  // Handle day header click for filtering
  const handleDayHeaderClick = useCallback((date: Date) => {
    setSelectedDay((currentSelectedDay) => {
      const clickedDate = new Date(date);
      clickedDate.setHours(0, 0, 0, 0);

      // Toggle selection if same day, otherwise select new day
      if (currentSelectedDay) {
        const current = new Date(currentSelectedDay);
        current.setHours(0, 0, 0, 0);
        if (current.getTime() === clickedDate.getTime()) {
          return null; // Deselect
        }
      }
      return clickedDate;
    });
  }, []);

  const handleScheduleTicket = useCallback(
    async (ticketId: string, scheduledDate: string) => {
      try {
        await scheduleTicket(ticketId, scheduledDate);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, scheduled_date: scheduledDate } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to schedule ticket:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleUnscheduleTicket = useCallback(
    async (ticketId: string) => {
      try {
        await unscheduleTicket(ticketId);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, scheduled_date: undefined } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to unschedule ticket:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleCreateTicket = useCallback(
    (ticket: Ticket, projectKey: string) => {
      if (tickets[projectKey]) {
        const updatedTickets = [...tickets[projectKey], ticket];
        updateTickets(projectKey, updatedTickets);
      }
      refetch();
    },
    [refetch, tickets, updateTickets],
  );

  // Handle time selection for creating new tickets
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (selectInfo.start) {
      const startMoment = moment.tz(selectInfo.startStr, "Australia/Sydney");
      const startOfDay = startMoment.clone().startOf("day").toDate();
      setSelectedDay(startOfDay);
    }
  }, []);

  // Unselect calendar on outside click
  const handleUnselectCalendar = useCallback(() => {
    const api = calendarRef.current?.getApi();
    api?.unselect();
    closeContextMenu();
    longPressHandlers.clearEditableEvent();
  }, [calendarRef, closeContextMenu, longPressHandlers]);

  // Handle clicks outside calendar
  useCallback(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleUnselectCalendar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [containerRef, handleUnselectCalendar]);

  // Generate title from selected date
  const title = getWeekRangeTitle(selectedDate);

  // Transform events to FullCalendar format
  const calendarEvents = transformEventsToCalendarFormat(events, projects);

  return (
    <div className="h-full w-full">
      <PlannerLayout
        sidebar={
          <TicketsSidebar
            tickets={tickets}
            projects={projects}
            selectedProjectKey={selectedProjectKey}
            selectedDay={selectedDay}
            events={events}
            onProjectChange={selectProject}
            onTicketClick={handleTicketClick}
            onScheduleTicket={handleScheduleTicket}
            onUnscheduleTicket={handleUnscheduleTicket}
            onCreateTicket={handleCreateTicket}
            onUnselectCalendar={handleUnselectCalendar}
          />
        }
        coachesSidebar={<CoachesSidebar />}
        calendar={
          <div ref={containerRef} className="flex h-full flex-col">
            <CalendarHeader
              title={title}
              currentDate={selectedDate}
              onPrevious={goToPreviousPeriod}
              onNext={goToNextPeriod}
              onToday={goToToday}
              isTodayInRange={isTodayInRange}
            />

            <div className="relative flex-1 overflow-hidden">
              <CalendarView
                calendarRef={calendarRef}
                events={calendarEvents}
                selectedDay={selectedDay}
                isDragging={eventDragState.isDragging}
                editableEventId={longPressHandlers.editableEventId}
                onDatesSet={handleDatesSetWithToday}
                onEventClick={handleEventClickWrapper}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onEventReceive={handleEventReceive}
                onDateSelect={handleDateSelect}
                onDrop={handleDrop}
                onDayHeaderClick={handleDayHeaderClick}
                showContextMenu={showContextMenu}
                hideContextMenu={closeContextMenu}
                onTouchStart={(e, eventId) => {
                  longPressHandlers.handleTouchStart(e, eventId, (x: number, y: number) => showContextMenu(x, y, eventId), closeContextMenu);
                }}
                onTouchEnd={longPressHandlers.handleTouchEnd}
                onDragStart={eventDragState.handleDragStart}
                onDragStop={eventDragState.handleDragStop}
                onResizeStart={eventDragState.handleResizeStart}
                onResizeStop={eventDragState.handleResizeStop}
              />

              <CalendarContextMenu
                contextMenu={rawContextMenu}
                onEdit={handleEventClickWrapper}
                onDelete={(eventId) => handleContextMenuAction("delete", eventId)}
                onClose={closeContextMenu}
              />
            </div>
          </div>
        }
      />

      <TicketModal
        open={selectedTicket !== null}
        onClose={() => {
          setSelectedTicket(null);
          setSelectedEventId(null);
        }}
        ticketId={selectedTicket?.ticket_id || null}
        eventId={selectedEventId}
        events={events}
        onEventUpdate={updateEvents}
        projects={projects}
        ticket={selectedTicket}
      />
    </div>
  );
}
