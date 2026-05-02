# Changelog

All notable changes to this project will be documented in this file.

This is a living document maintained to track feature additions, bug fixes, and architectural changes. Use this to inform commit messages and track progress.

**Format:** Each entry includes a feature name and completion date (TBD for in-progress work). This is an append-only document, except for in-progress entries which are rewritten until complete.

---

## [In Progress]

### Feature: Skills - CC-138 - TBD

- Add `/skills/` root directory structure for logically separated skill components
- Create `skills/example-focus/` with `focus.config.ts` and `daily-journal` example skill
- Create `/packages/skills-api/` library (events, tickets, and persistent NoSQL-style data CRUD)
- Add `src/types/skill.ts` with `FocusConfig`, `SkillConfig`, `RegisteredSkill`, `RegisteredFocus` types
- Add `src/lib/skills-registry.ts` static registry importing all skills from `/skills/`
- Add `@skills-api` TypeScript path alias pointing to `/packages/skills-api/`
- Create `src/components/planner/SkillsSidebar.tsx` (focus selector + skill list)
- Create `src/components/skills/SkillsContent.tsx` (skill card grid + selected skill renderer with back button)
- Add "Skills" tab to `PlannerNavBar` (desktop) and `MobileTabMenu` (mobile) using `Puzzle` icon
- Update `PlannerLayout` to accept `skillsSidebar` and `skillsContent` props; content area swaps to skills when skills panel is active
- Wire up skills state in `src/app/page.tsx`

---

## [Completed]

### Fix: Marker Maintains Full Width When Overlapping Events - CC-102 - 2026-04-27

- Target `.fc-timegrid-event-harness:has(.event-marker)` in CSS to force the FullCalendar harness wrapper (which receives inline `left`/`right`/`width` overlap-avoidance styles) to always be full column width with z-index above other events, so markers no longer shrink to half-width when placed on top of another event

### Feature: Point in Time Markers - CC-102 - 2026-04-24

- Add `event_type` field ("standard" | "break" | "marker") to `CalendarEvent` to replace the legacy `is_break` boolean discriminant
- Add `MarkerEvent`, `CreateMarkerResponse` types and `marker_colour` field to the data model
- Add `createMarker()` API function posting to `/events/markers`; extend `updateEvent()` to accept a `colour` field
- Render markers as FullCalendar `display: "background"` events with a 5-minute window, styled as 4px thin bars that expand to 8px on hover; title is hidden by default and shown via a JS tooltip on mouse-over
- Add "Create Marker" option to the calendar selection context menu
- Add "Marker" tab to `CreationModeToggle` (enabled only when a time range is selected)
- Add marker creation/rename mode to `CreationHotbar` with an inline colour picker (default #2563eb)
- Add "Rename Marker" / "Remove Marker" options to the marker right-click context menu
- Exclude markers from focus-filter logic (always visible, same behaviour as breaks)

### Feature: GitHub Environment Scoping for CI/CD - CC-115 - 2026-04-23

- Scope `deploy-dev` job to the `dev` GitHub repository environment so secrets and variables are drawn from environment-level config
- Scope `deploy-feature` and `teardown-feature` jobs to the `feature` GitHub repository environment for the same reason
- Pass `NEXT_PUBLIC_API_BASE_URL` from `vars.NEXT_PUBLIC_API_BASE_URL` into the deploy step so the Next.js static export bakes in the correct API URL per environment
- Add a "GitHub Environments Setup" table to `README.md` documenting the required secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) and variable (`NEXT_PUBLIC_API_BASE_URL`) for each environment

### Feature: Dev Environment CD Workflow - CC-115 - 2026-04-23

- Add a push-triggered GitHub Actions workflow that deploys `dev` when `master` receives new commits
- Reuse the existing `deploy.sh dev` deployment path with repository AWS secrets
- Keep feature-environment deployment workflow unchanged

### Feature: Feature Environment Deployments - CC-115 - 2026-04-22

- Update `deploy.sh` to support only `dev` and `feat-<ticket-code>` environments
- Deploy frontend artifacts to environment-scoped S3 prefixes (`dev/` and `feat-.../`)
- Add PR-triggered GitHub Actions workflow that auto-detects ticket code (`CC-123`) from PR title/branch and deploys `feat-cc-123`
- Tear down feature environment S3 prefix automatically when a PR is merged
- Update deployment commands in `README.md` and `package.json` to match the new environment model

### Feature: Focus Filter for Calendar - CC-90 - 2026-02-15

- Add focus filter functionality to calendar view
- Implement storage utilities for persisting filter preferences
- Integrate filter with calendar header and event display

### Feature: Hotbar Creation Interface - CC-66 - 2026-01-14

- Redesign ticket/focus creation from modal to hotbar-style popup
- Add toggle between "Ticket" and "Focus" creation modes
- Implement horizontal scrollable expandable options with caret indicators
- Position hotbar centered with no background blur or shading
- Support default type detection ("Event" from calendar, "Task" from + button)
- Add image icon button for future "create from image" flow
- Maintain quick, temporary feel with click-outside-to-dismiss behavior

### Refactor: Consolidate Ticket Type Colors - 2026-01-12

- Consolidate all ticket type color definitions into themes.css CSS variables
- Create comprehensive color tokens for all ticket types (task, story, bug, epic, event)
- Add light and dark mode color variants for backgrounds, text, and hover states
- Update ticket-type-utils.ts to use CSS variables instead of hardcoded Tailwind colors
- Fix dark mode display issues where ticket type colors weren't showing
- Update TicketCard component to use consolidated color system
- Update epic Diamond icon to use purple color from theme variables
- Simplify code by removing redundant dark mode class suffixes

### Feature: Domains Sidebar & Mobile Navigation - CC-61 - 2026-01-12

- Created domains sidebar with project/domain selection and epic management
- Added tab menu for epics in domains sidebar
- Implemented domain edit modal with compact/full modes similar to ticket modal
- Added domain status dropdown with proper status groups
- Renamed "Project" to "Domain" and "Projects" to "Focuses" throughout the application UI
- Added mobile tab menu above header with tickets, domains, and theme toggle buttons
- Improved mobile navigation with drawer experience for both tickets and domains
- Updated PlannerLayout to support multiple sidebars
- Added TypeSelect disabled state that looks normal but isn't clickable
- Hidden Epic property row when viewing epic-type tickets

### Refactor: Ticket Modal Compact Mode - CC-59 - 2026-01-11

- Add dynamic mode switching between "compact" and "full" views based on content
- Implement compact mode for tickets with minimal information (no description/linked tickets/documents)
- Add pill-shaped "+" buttons for adding description, linked tickets, and related documents
- Redesign layout: single column in compact mode, two-column in full mode
- Display linked tickets and related documents in main content area with proper icons
- Improve mobile-responsive behavior for both modes
- Status badge changes to rounded-full in compact mode for cleaner look

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
