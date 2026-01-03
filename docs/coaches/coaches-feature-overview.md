# Coaches Feature – Concept Overview

**Last updated:** 2026-01-03

This document captures the high-level concept and requirements for the "Coaches" feature in the Command Centre application.

## Coaches

### Tool-driven conversations
- Tools are fully integrated across the app, not just in chat sections.
- Key interaction types:
  - Question dialogs
  - Calendar scheduling/bookings
  - Review analytics/graphs
  - Training curation planning
  - Training/session review

### Weekly realtime review conversations
- Weekly live-style review conversations with the user.
- All coaches join with a structured agenda.
- The most appropriate coach responds based on the user prompt.
- Support for custom coach voices.

### Calendar ticket/event/history MCP server
- Coaches can look back and see what the user did/said on particular days.
- Coaches can search history to find when the user did things.
- Coaches use historical data to determine next steps for their programs.

### Program building
- Unstructured planning sessions are converted into a structured format.
  - Users can express training desires/exercises, etc. in an unstructured way.
  - Unstructured user requests get structured into the best available program format.
- Users and coaches collaboratively define expectations.
  - Coaches can lightly or strongly enforce expectations based on the selected profile.

### Happiness stats
- Each coach has a happiness state/stat.
- Stats reflect how well the user is meeting obligations.
- Depending on profile, some coaches are more sensitive/"short" than others.

### Goals and objectives
- Automatically tracked through completed tickets under the coach's managed training domain(s).
- Goals are long-term; Objectives are short-term.
- Goals consist of stages:
  - Tickets are assigned to stages.
  - Stages have total points required for completion.
  - Total score is the aggregated total of ticket scores.
  - Ticket scores are determined by difficulty and time estimates.
  - Stage totals are recalculated when new tickets are assigned.

### Scoring
- Generic progress scores:
  - Awarded via ticket completion.
  - Stages and Programs track total scores towards completion.
- Yields:
  - Yields are reward-like concepts such as "Streaks", "Words", "Wins", etc.
  - Yields dynamically appear on events based on eligibility.
    - Example: a "Streak" yield appears on an event only if completing that event means the user has completed that type of task one or more times in a row, on time.

### Profiles
- Coaches have different characteristics:
  - Some get unhappy faster and require more accountability.
  - Some are more relaxed and encouraging.
  - Some require occasional verification to ensure accountability.

## UI/UX

### Interaction model
- Prefer quick popup dialogs rather than a dedicated chat page.
- Most interactions are purely functional/app-based or quick selection answers.
- All interaction happens on a single page (no navigation away for coach flows).

### Navigation layout
- **Top nav buttons** for sidebar drawer sections:
  - Tickets
  - Programs
  - Coaches
  - Daily Quick Notes (existing AI-based note taking feature)
- Clicking a sidebar drawer button also opens the corresponding primary content page on the left.
  - Alternative option: separate page buttons underneath with a separator.
  - Current preference: first option (drawer buttons that also control the main content) feels more intuitive.
- **Bottom nav buttons** for user options:
  - User/account settings
  - Light/Dark mode

### Coaches Lens
- Toggle between coaches to "tunnel in" on their events.
- Show improvement indicators (inspired by focused views like in Civ 6):
  - Could show "+1" or similar performance markers on events.
  - Could show projected score/resources (e.g., points towards goals) awarded by completing an event.
  - Scoring is only meaningful if scores have real use:
    - Scores can be points towards a goal where the full bar can only be completed once the goal itself is actually complete (scores adjusted accordingly).

## Visual Assets

Supporting concept art and UI references for Coaches live under `docs/coaches/images`.

- **Coach portraits** (`coach_amari.png`, `coach_moksha.png`, `coach_pingala.png`, `coach_wealthy.png`, `coach_zore.png`)
  - Represent different coach profiles and personalities.
  - Used anywhere we need to visually distinguish coaches (Coaches Lens, sidebars, dialogs).

- **Yield icons** (`streak_yield.png`, `words_yield.png`, `workouts_yield.png`, `books_read_yield.png`, `combos_yield.png`, `completion_yield.png`, `logged_yield.png`, `mastery_yield.png`, `milestone_yield.png`, `yield_icons.png`)
  - Visual language for "Yields" described in the Scoring section.
  - Each icon corresponds to a specific reward track or metric (e.g., streaks, words written, workouts completed).
  - Intended for use on calendar events, tickets, and program/stage summaries when the associated yield is eligible.

These images are reference assets for design and implementation; the actual in-app components should treat them as part of a cohesive visual system aligned with the scoring and profiles concepts above.

## Backend & Infrastructure

### Tool calling dialog system
- Central system for orchestrating tool calls during coach conversations and dialogs.

### Coach engagement
- Persistence and logic for tracking coach engagement and state.
- Backed by a database layer.

### Program building engine
- Supports chain-of-thought style planning.
- Integrates with a note taking system for sessions.

### MCP Server / RAG
- History lookup and retrieval for past events, tickets, and conversations.
- Domain/Program tracking to associate history with specific coaching domains and programs.
