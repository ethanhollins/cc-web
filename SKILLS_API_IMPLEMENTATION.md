# Skills API Integration - Implementation Summary

This document outlines the implementation of the Skills API integration, including the modal for creating skills/objectives and auto-saving node positions.

## ⚠️ Important: No Mock Data

**The frontend now uses 100% real backend data.** All mock data dependencies have been removed from the skills page and graph. The application:
- Fetches all skills and objectives from `GET /skill` on page load
- Fetches graph data (including all nodes and positions) from `GET /skill/{skill_id}/graph` when opening a tab

## Files Created/Modified

### New Files Created

1. **`src/utils/skills-api.ts`**
   - API client for all skills-related endpoints
   - Functions: `getAllSkills`, `createSkill`, `getSkill`, `updateSkill`, `deleteSkill`, `getSkillGraph`, `linkTicketToSkill`, `unlinkTicketFromSkill`, `updateTicketPositions`

2. **`src/utils/transform-skills.ts`**
   - Transforms backend API responses to frontend type definitions
   - Handles conversion of stage names (lowercase → Title Case)
   - Converts assessment rubrics to frontend RubricCriterion format
   - Functions: `transformSkill`, `transformMasterySkill`, `transformObjective`, `transformSkills`

3. **`src/utils/transform-graph.ts`** (NEW)
   - Transforms skill graph API responses to frontend data structures
   - Handles all node types: `mastery`, `objective`, `stage`, `ticket`
   - Builds connections between tickets and stages from `linked_stages`
   - Functions: `transformSkillGraph`, `transformStageNode`, `transformTicketNode`

3. **`src/components/application/modals/CreateSkillModal.tsx`**
   - Modal component for creating new skills or objectives
   - Features:
     - Type selection (Mastery Skill vs Objective)
     - Name input field
     - Expandable AI prompt textarea
     - Form validation
     - Loading states

4. **`src/hooks/use-auto-save-queue.ts`**
   - Hook for batching position updates
   - Queues changes and automatically saves after 5 seconds of inactivity
   - Features: `queuePositionUpdate`, `forceSave`, queue size tracking

5. **`src/hooks/use-skills.ts`**
   - Hook for fetching and managing skills data
   - `useSkills()` - fetches all skills/objectives from `GET /skill` endpoint
   - `useSkillGraph(skillId, skills, objectives)` - fetches graph data and transforms it
   - **Now using real API data for both skills list and graph**

6. **`src/hooks/use-ticket-skill-link.ts`**
   - Hook for linking/unlinking tickets to skills
   - Functions: `linkTicket`, `unlinkTicket`
   - Provides loading states and error handling

### Modified Files

1. **`src/app/skills/page.tsx`**
   - Integrated `CreateSkillModal`
   - Updated to use `useSkills()` hook for skills/objectives
   - **Uses `useSkillGraph()` to fetch graph when opening tabs**
   - Removed all mock data dependencies
   - Added loading states for skills and graph
   - Refetches skills after creation
   - Graph auto-fetches when activeTabId changes
   - Passes all graph data to SkillGraph component

2. **`src/components/application/skills/SkillGraph.tsx`**
   - Integrated auto-save queue hook
   - Added `onNodeDragStop` handler for ticket position updates
   - Automatically queues position changes after dragging ticket nodes

## API Endpoints Used

### Implemented Endpoints

- **GET `/skill`** - Get all skills and objectives
- **GET `/skill/{skill_id}/graph`** - **Get complete graph with all nodes** (mastery, objective, stage, ticket)
- **POST `/skill`** - Create new skill/objective (async via SQS)
- **GET `/skill/{skill_id}`** - Get skill details
- **PATCH `/skill/{skill_id}`** - Update skill
- **DELETE `/skill/{skill_id}`** - Delete skill
- **POST `/skill/ticket/link`** - Link ticket to skill/stage (async via SQS)
- **DELETE `/skill/{skill_id}/stage/{stage_id}/ticket/{ticket_id}`** - Unlink ticket
- **PATCH `/skill/{skill_id}/ticket/position`** - Update ticket positions (batched)

## Backend Response Structure

### GET /skill

```json
{
    "skills": [
        {
            "skill_id": "skill-xxx",
            "node_id": "skill-xxx",
            "node_type": "mastery" | "objective",
            "name": "Skill Name",
            "stages": {
                "foundation": {
                    "stage_requirements": ["..."],
                    "assessment_rubric": [...]
                },
                // ... other stages
            }
        }
    ]
}
```

### GET /skill/{skill_id}/graph

```json
{
    "skill_graph": {
        "nodes": [
            {
                "node_id": "skill-xxx",
                "skill_id": "skill-xxx",
                "node_type": "mastery",
                "position": { "x": 100, "y": 200 }
            },
            {
                "node_id": "stage-xxx",
                "skill_id": "skill-xxx",
                "node_type": "stage",
                "linked_stages": ["foundation"],
                "position": { "x": 300, "y": 200 }
            },
            {
                "node_id": "ticket-xxx",
                "skill_id": "skill-xxx",
                "node_type": "ticket",
                "ticket_id": "ticket-xxx",
                "ticket_data": { /* full ticket object */ },
                "linked_stages": ["stage-xxx"],
                "scores": [
                    { "criterion_id": "F1", "score": 85 }
                ],
                "position": { "x": 500, "y": 200 }
            }
        ]
    }
}
```

## Data Transformation

### Skills List Transformation (`transform-skills.ts`)

Handles transformation of `GET /skill` response:

1. **Stage Name Normalization**: `foundation` → `"Foundation"`, `practitioner` → `"Practitioner"`, etc.
2. **Criterion Mapping**: 
   - `criterion_name` → `name`
   - `criterion_description` → `description`
   - `total_score` → `weight`
3. **Type Separation**: Splits API response into `skills[]` (mastery) and `objectives[]` arrays
4. **Default Values**: Adds default values for fields not yet provided by backend

### Graph Data Transformation (`transform-graph.ts`)

Handles transformation of `GET /skill/{skill_id}/graph` response:

1. **Node Type Handling**: Processes all 4 node types:
   - `mastery` → Updates skill position
   - `objective` → Updates objective position
   - `stage` → Creates SkillStageNode with stage extracted from node
   - `ticket` → Creates Ticket with full ticket_data
2. **Connection Building**: Uses `linked_stages` to connect tickets to stages
3. **Position Preservation**: All nodes keep their positions from the API
4. **Ticket Scoring**: Preserves criterion scores for each ticket

## Features Implemented

### 1. Create Skill/Objective Modal

- ✅ Opens when clicking "Add" button and selecting "New Skill" or "New Objective"
- ✅ Type selection between Mastery Skill (5-stage) and Objective (single goal)
- ✅ Name input field with contextual placeholder
- ✅ Expandable textarea for AI prompt
- ✅ Form validation
- ✅ Loading states during submission
- ✅ Error handling and display
- ✅ Calls `POST /skill` endpoint

### 2. Auto-Save Position Updates

- ✅ Queues ticket position changes when nodes are dragged
- ✅ Batches multiple changes together
- ✅ Automatically saves after 5 seconds of inactivity
- ✅ Uses `PATCH /skill/{skill_id}/ticket/position` endpoint
- ✅ Efficient - only sends updates for tickets (not skills/objectives/stages)

### 4. Skills Page Integration

- ✅ Modal integrated with "Add" dropdown menu
- ✅ Handlers for creating both skills and objectives
- ✅ Success callback refetches skills after creation
- ✅ Loading state while fetching skills from backend
- ✅ **Uses real API data exclusively - no mock data**
- ✅ Reconstructs tabs from localStorage using fetched skills
- ✅ Ready for backend SQS async responses (not handled yet as per requirements)

### 4. Graph Component Updates

- ✅ Auto-save hook integrated
- ✅ `onNodeDragStop` handler queues position updates
- ✅ Only ticket nodes trigger position saves
- ✅ Skill/objective/stage nodes don't trigger saves (their positions likely managed differently)

## Data Flow

1. **Page Load**: 
   - `useSkills()` hook calls `GET /skill`
   - Response transformed via `transformSkills()`
   - Skills and objectives populated in state
   - DefaultSkillsPage displays skill/objective carousels

2. **Opening a Tab**:
   - User clicks a skill/objective card
   - Tab added and activeTabId set
   - `useSkillGraph(activeTabId)` automatically triggers
   - `GET /skill/{skill_id}/graph` called
   - Response transformed via `transformSkillGraph()`
   - All nodes (mastery, objective, stage, ticket) extracted
   - Connections built from `linked_stages`
   - SkillGraph component renders with complete graph data

3. **Creating a Skill**:
   - User clicks "+" → "New Skill" or "New Objective"
   - CreateSkillModal opens
   - User fills form and submits
   - `POST /skill` called (async via SQS)
   - On success, `refetchSkills()` called to get updated list

4. **Moving Tickets**:
   - User drags a ticket node
   - `onNodeDragStop` fires
   - Position queued in auto-save hook
   - After 5 seconds of inactivity, `PATCH /skill/{skill_id}/ticket/position` called

## Environment Variables Required

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
```

This should point to your API Gateway or backend server URL.

## Usage

### Creating a Skill/Objective

1. Click the "+" button in the top-right corner of the skills page
2. Select "New Skill" or "New Objective"
3. Choose the type (Mastery Skill or Objective)
4. Enter a name
5. Enter an AI prompt describing the skill/objective
6. Click "Create"

The request is sent to the backend, which processes it asynchronously via SQS.

### Auto-Save Node Positions

Simply drag ticket nodes around the graph. The system will:
1. Queue the position change
2. Wait for 5 seconds of inactivity
3. Batch all queued changes together
4. Send a single PATCH request with all position updates

### Linking Tickets to Skills

Use the `useTicketSkillLink` hook:

```typescript
import { useTicketSkillLink } from "@/hooks/use-ticket-skill-link";

const { linkTicket, unlinkTicket, isLinking } = useTicketSkillLink();

// Link a ticket
await linkTicket(skillId, stageId, ticketId);

// Unlink a ticket
await unlinkTicket(skillId, stageId, ticketId);
```

## Notes

- **No Mock Data**: The frontend fetches all data from the backend API. No mock data is used for skills, objectives, stage nodes, or tickets in the graph.

- **Graph Node Types**: The `/skill/{skill_id}/graph` endpoint returns 4 node types:
  - `mastery` - Mastery skill nodes
  - `objective` - Objective nodes
  - `stage` - Stage nodes (Foundation, Practitioner, etc.)
  - `ticket` - Ticket nodes with full ticket data

- **Connection Logic**: Tickets are connected to stages via the `linked_stages` array in the ticket node. The transformation layer builds these connections during graph processing.

- **SQS Async Responses**: As per requirements, the code doesn't handle SQS async responses yet. The `createSkill` and `linkTicketToSkill` functions make the request and log the response but don't wait for processing completion.

- **Data Transformation**: Two separate transformation utilities:
  - `transform-skills.ts` - Transforms skills list from `GET /skill`
  - `transform-graph.ts` - Transforms graph data from `GET /skill/{skill_id}/graph`

- **Stage Extraction**: Stage nodes extract their stage type from the node_id or linked_stages field. The format is flexible to accommodate backend variations.

## Future Enhancements

1. Implement WebSocket or polling for SQS async response handling
2. Add stage nodes and tickets endpoints to replace remaining mock data
3. Add optimistic updates for better UX
4. Add undo/redo for position changes
5. Add conflict resolution for concurrent position updates
6. Show queue status indicator (e.g., "Saving..." badge)
7. Implement search/filter functionality using the fetched skills
8. Add error boundaries for graceful error handling
9. Implement retry logic for failed API calls
10. Add caching layer for frequently accessed data
