"use client";

import { useCallback, useRef, useState } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";
import { createBreak, createEvent } from "@/api/calendar";
import {
  scheduleTicket,
  unscheduleTicket,
  updateTicketEpic,
  updateTicketPriority,
  updateTicketProject,
  updateTicketStatus,
  updateTicketType,
} from "@/api/tickets";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TicketModal } from "@/components/modals/TicketModal";
import { PlannerLayout } from "@/components/planner/PlannerLayout";
import { TicketCreateModal } from "@/components/planner/TicketCreateModal";
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

  // Event creation trigger state (for calendar time selection)
  const [eventCreationTrigger, setEventCreationTrigger] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Projects and tickets
  const { projects, selectedProjectKey, selectProject } = useProjects();
  const { tickets, updateTickets, fetchTicketsForProject } = useTickets(selectedProjectKey, projects);

  // Flatten all tickets for the modal (so epics can be found across all projects)
  const allTickets = Object.values(tickets).flat();

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

  // Calendar events with caching (and automatic ticket fetching)
  const { events, isLoading: _isLoading, updateEvent, deleteEvent, updateEvents, refetch } = useCalendarEvents(selectedDate, fetchTicketsForProject);

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
      // Find the actual ticket and project from state
      const ticket =
        selectedProjectKey && tickets[selectedProjectKey] ? tickets[selectedProjectKey].find((t) => t.ticket_id === eventData.ticket_data.ticket_id) : null;
      const project = projects.find((p) => p.project_id === eventData.project_id);

      // Optimistically add the event to local state first with real ticket data
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: CalendarEvent = {
        google_id: tempId,
        ticket_id: eventData.ticket_data.ticket_id,
        ticket_key: ticket?.ticket_key || "",
        ticket_type: ticket?.ticket_type || "task",
        title: eventData.ticket_data.title,
        ticket_status: ticket?.ticket_status || "In Progress",
        project_id: eventData.project_id,
        project: project,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        colour: ticket?.colour || "",
        epic: ticket?.epic || "",
        google_calendar_id: eventData.calendar_id,
        all_day: false,
        completed: false,
        isOptimistic: true,
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

  const handleTicketClick = useCallback(
    (ticket: Ticket) => {
      setSelectedTicket(ticket);

      // If there's a selected day and the ticket has events, find the event for that day
      if (selectedDay && events.length > 0) {
        const dayStart = new Date(selectedDay);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDay);
        dayEnd.setHours(23, 59, 59, 999);

        // Find event for this ticket on the selected day
        const eventForDay = events.find((event) => {
          if (event.ticket_id !== ticket.ticket_id) return false;
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);
          return start <= dayEnd && end >= dayStart;
        });

        setSelectedEventId(eventForDay?.google_id || null);
      } else {
        setSelectedEventId(null); // Clear event ID when no selected day
      }
    },
    [selectedDay, events],
  );

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

  const handleStatusChange = useCallback(
    async (ticketId: string, newStatus: string) => {
      try {
        await updateTicketStatus(ticketId, newStatus);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, ticket_status: newStatus as Ticket["ticket_status"] } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to update ticket status:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleTypeChange = useCallback(
    async (ticketId: string, newType: string) => {
      try {
        await updateTicketType(ticketId, newType);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, ticket_type: newType as Ticket["ticket_type"] } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to update ticket type:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleProjectChange = useCallback(
    async (ticketId: string, newProjectId: string) => {
      try {
        await updateTicketProject(ticketId, newProjectId || null);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, project_id: newProjectId || undefined } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to update ticket project:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleEpicChange = useCallback(
    async (ticketId: string, newEpicId: string) => {
      try {
        await updateTicketEpic(ticketId, newEpicId || null);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, epic: newEpicId || undefined } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to update ticket epic:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handlePriorityChange = useCallback(
    async (ticketId: string, newPriority: string) => {
      try {
        // Send lowercase priority to API
        const priorityValue = newPriority ? newPriority.toLowerCase() : null;
        await updateTicketPriority(ticketId, priorityValue);

        if (selectedProjectKey && tickets[selectedProjectKey]) {
          const updatedTickets = tickets[selectedProjectKey].map((ticket) =>
            ticket.ticket_id === ticketId ? { ...ticket, priority: priorityValue || undefined } : ticket,
          );
          updateTickets(selectedProjectKey, updatedTickets);
        }

        await refetch();
      } catch (error) {
        console.error("Failed to update ticket priority:", error);
      }
    },
    [refetch, selectedProjectKey, tickets, updateTickets],
  );

  const handleCreateTicket = useCallback(
    (ticket: Ticket, projectKey: string) => {
      // Update tickets list
      if (tickets[projectKey]) {
        const updatedTickets = [...tickets[projectKey], ticket];
        updateTickets(projectKey, updatedTickets);
      }

      // Optimistically add to calendar events if it has start/end dates
      // The ticket response should include these fields if it was created as an event
      if (updateEvents) {
        const ticketAsCalendarEvent = ticket as CalendarEvent;
        if (ticketAsCalendarEvent.start_date && ticketAsCalendarEvent.end_date && ticketAsCalendarEvent.google_calendar_id) {
          updateEvents((prevEvents) => [...prevEvents, ticketAsCalendarEvent]);
        }
      }

      setEventCreationTrigger(null);
      setShowCreateModal(false);
      refetch();
    },
    [refetch, tickets, updateTickets, updateEvents],
  );

  const handleCloseCreateModal = useCallback(() => {
    setEventCreationTrigger(null);
    setShowCreateModal(false);
  }, []);

  // Handle creating event from time selection
  const handleCreateEventFromSelection = useCallback((startDate: Date, endDate: Date) => {
    setEventCreationTrigger({ startDate, endDate });
    setShowCreateModal(true);
  }, []);

  // Handle scheduling break from time selection
  const handleScheduleBreak = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        // Call the API to create the break event
        const result = await createBreak({
          title: "Break",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

        // Create a break event locally with the returned event_id
        const breakEvent: CalendarEvent = {
          google_id: result.event_id,
          ticket_id: "",
          ticket_key: "",
          ticket_type: "task",
          title: "Break",
          ticket_status: "In Progress",
          project_id: "",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          colour: "",
          epic: "",
          google_calendar_id: "",
          all_day: false,
          completed: false,
          is_break: true,
        };

        // Add break event to calendar
        updateEvents?.((prev) => [...prev, breakEvent]);
      } catch (error) {
        console.error("Failed to create break:", error);
        // Optionally show an error notification to the user
      }
    },
    [updateEvents],
  );

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
  const calendarEvents = transformEventsToCalendarFormat(events, projects, tickets);

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
            onStatusChange={handleStatusChange}
            onCreateTicket={handleCreateTicket}
            onUnselectCalendar={handleUnselectCalendar}
          />
        }
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
                onCreateEvent={handleCreateEventFromSelection}
                onScheduleBreak={handleScheduleBreak}
                onDrop={handleDrop}
                onDayHeaderClick={handleDayHeaderClick}
                showContextMenu={showContextMenu}
                hideContextMenu={closeContextMenu}
                eventContextMenu={rawContextMenu}
                onEventEdit={handleEventClickWrapper}
                onEventDelete={(eventId) => handleContextMenuAction("delete", eventId)}
                onTouchStart={(e, eventId) => {
                  longPressHandlers.handleTouchStart(e, eventId, (x: number, y: number) => showContextMenu(x, y, eventId), closeContextMenu);
                }}
                onTouchEnd={longPressHandlers.handleTouchEnd}
                onDragStart={eventDragState.handleDragStart}
                onDragStop={eventDragState.handleDragStop}
                onResizeStart={eventDragState.handleResizeStart}
                onResizeStop={eventDragState.handleResizeStop}
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
        tickets={allTickets}
        ticket={selectedTicket}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
        onProjectChange={handleProjectChange}
        onEpicChange={handleEpicChange}
        onPriorityChange={handlePriorityChange}
      />

      <TicketCreateModal
        open={showCreateModal}
        projects={projects}
        selectedProjectKey={selectedProjectKey}
        initialDateRange={eventCreationTrigger}
        onClose={handleCloseCreateModal}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
}
