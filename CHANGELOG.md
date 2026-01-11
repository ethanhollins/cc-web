# Changelog

All notable changes to this project will be documented in this file.

This is a living document maintained to track feature additions, bug fixes, and architectural changes. Use this to inform commit messages and track progress.

**Format:** Each entry includes a feature name and completion date (TBD for in-progress work). This is an append-only document, except for in-progress entries which are rewritten until complete.

---

## [In Progress]

---

## [Completed]

### Refactor: API Migration & UI Enhancements - 2026-01-11

- Rename `isBreak` to `is_break` for API consistency across all calendar event references
- Add break event creation API integration with proper backend support
- Implement status change functionality with inline status select dropdown in ticket cards
- Add `StatusSelect` component with grouped status options (To-do, In progress, Complete)
- Create `ticket-status-utils.ts` with reusable status styling utilities
- Update ticket filtering to show Done/Removed tickets until completion_date
- Add `completion_date` field to Ticket type for tracking when tickets were completed
- Refactor ticket sorting to prioritize Blocked tickets at top, Done/Removed at bottom
- Improve unscheduled tab filter to include Blocked status tickets
- Migrate ticket modal from `useTicketNotionData` to new `useTicketData` hook
- Add `updateTicketStatus` and `fetchTicketDetails` API functions
- Consolidate API type definitions with `TicketDetailsResponse` interface
- Implement WebSocket message listener pattern to avoid unnecessary re-renders
- Update context menu for break events with "Rename Break" and "Remove Break" options
- Fix break event deletion to handle empty calendar_id
- Simplify ticket creation API with unified `projectId` and `ticketType` parameters
- Remove unused `WebSocketProvider` from old layout
- Add dark mode support to ticket type strip colors and status select

### CC-58: Fix Today Tickets Filter Logic - 2026-01-08

- Fix today tab to show tickets with events on selected day or previous days (excluding Backlog status)
- Update filter logic to correctly categorize tickets with calendar events into today tab instead of unscheduled tab
- Event-type tickets now only show on days with actual events (not future days)
- Done tickets with events show from first event date through last event date
- Extract ticket sorting logic to reusable utility function in `src/utils/ticket-sort.ts`
- Sort tickets by: Done status (bottom), type (Story→Task→Bug→Event), status (In Review→In Progress→Todo→Ongoing→Blocked), then ticket key
- Add spacing to ticket cards with empty bottom sections for consistent layout
- Fix ticket modal to show correct event instance when clicking from sidebar (use selected day's event)
- Improve mobile calendar selection with reduced long press delay (500ms) and `selectMinDistance=0`

### CC-57: Schedule Break UI with Zigzag Edges - 2026-01-08

- Implement "Schedule Break" button in calendar time selection context menu
- Create break event component with distinctive visual design (zigzag edges, flat appearance)
- Add CSS-based zigzag pattern using conic gradients for consistent frequency at any height
- Support both short (<30 min) and regular break event layouts
- Add theme-aware styling with light/dark mode support via CSS custom properties
- Create break events locally without backend integration (placeholder for future API)
- Style break events to blend with calendar background (no border, square corners, subtle colors)
- Add `isBreak` property to CalendarEvent type for break event identification
- Implement break-specific styling in calendar event transformation

### CC-55: Calendar Time Selection for Event Creation - 2026-01-07

- Implement time selection context menu with "Create Event" and "Schedule Break" actions
- Add `useCalendarSelection` hook for managing calendar time selection state
- Create reusable `ContextMenuButton` component for context menu actions
- Refactor `CalendarContextMenu` to support both event and selection menu types (union type)
- Add optimistic UI updates for newly created calendar events
- Integrate time selection into planner page with `TicketCreateModal` support
- Add date-time utilities (`toTimezone`, `parseInTimezone`) for timezone handling
- Support creating events directly from calendar time selection drag
- Update API client to handle event creation with start/end dates
- Display visual indicators for optimistic events (loading state overlay)

### CC-48: Soft Light/Dark Theming for Planner - 2026-01-02

- Define soft light/dark global theme tokens and planner-specific CSS variables, and load them via the app root layout
- Add a dedicated `usePlannerTheme` hook plus `PlannerNavBar` to provide a planner-only soft light/dark toggle with persisted user preference
- Update planner layout and calendar components (header, view, events, FullCalendar CSS) to consume the new theme tokens, including all-day row and selected-day highlighting
- Refresh the tickets sidebar with `TicketCard` and `TicketCreateModal` components styled against the new palette while preserving drag-and-drop and scheduling behaviour
- Implement ticket scheduling/unscheduling API integration and TODOs on planner page
- Add shared popover positioning utility and refactor TicketCard/TicketCreateModal to use it
- Consolidate error-utils imports to use @/utils alias consistently
- Finalize themes.css for production (remove scaffolding comments)
- Add toggle behavior to CalendarCard popup in TicketCard schedule button

### Project Setup & Configuration - 2025-12-31

- Added CHANGELOG.md for tracking project changes
- Created GitHub Copilot instructions document
- Installed shadcn/ui dependencies (class-variance-authority, lucide-react)
- Configured shadcn/ui with New York style and Tailwind CSS 4

### CC-45: Refactor Planner Page with New Component Library - 2026-01-01

- [x] Migrate planner page from legacy components to shadcn/ui architecture
- [x] Create reusable calendar component wrapper around FullCalendar
- [x] Support multiple calendar views (week, day) with configurable options
- [x] Centralize data management with enhanced hooks (projects, tickets, events)
- [x] Implement real-time WebSocket updates across all components
- [x] Build mobile-responsive design with touch interactions
- [x] Use library-first approach with minimal custom code
- [x] Maintain exact same FullCalendar functionality (drag/drop, resize, context menu)
- [x] Add context menu with Open Event and Delete actions
- [x] Implement right-click and long-press handlers for touch devices
- [x] Integrate TicketModal for viewing/editing event details
- [x] Add day header selection for filtering sidebar tickets
- [x] Support event creation from time slot selection
- [x] Add optimistic UI updates for drag/drop/resize operations
- [x] Implement outside click handling to close menus and unselect
- [x] Add tab-based filtering (Today/Unscheduled/Backlog) in sidebar
- [x] Complete TicketModal implementation with full CRUD operations
- [x] Add calendar picker widget for manual ticket scheduling
- [x] Implement event/ticket API integration
- [x] Add comprehensive error handling and loading states

### Project Setup & Configuration - 2025-12-31

- Added CHANGELOG.md for tracking project changes
- Created GitHub Copilot instructions document
- Installed shadcn/ui dependencies (class-variance-authority, lucide-react)
- Configured shadcn/ui with New York style and Tailwind CSS 4
