import type { TicketType } from "@/types/ticket";

export const TYPE_OPTIONS = ["task", "story", "bug", "event"] as TicketType[];

export function getTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    task: "Task",
    story: "Story",
    bug: "Bug",
    event: "Event",
    epic: "Epic",
    subtask: "Subtask",
  };
  return typeMap[type.toLowerCase()] || type;
}

export function typePillClasses(type: string): string {
  const t = type?.toLowerCase();
  if (t === "task" || t === "subtask")
    return "bg-[var(--type-task-bg)] text-[var(--type-task-text)] dark:bg-[var(--type-task-bg-dark)] dark:text-[var(--type-task-text-dark)]";
  if (t === "story")
    return "bg-[var(--type-story-bg)] text-[var(--type-story-text)] dark:bg-[var(--type-story-bg-dark)] dark:text-[var(--type-story-text-dark)]";
  if (t === "bug") return "bg-[var(--type-bug-bg)] text-[var(--type-bug-text)] dark:bg-[var(--type-bug-bg-dark)] dark:text-[var(--type-bug-text-dark)]";
  if (t === "epic") return "bg-[var(--type-epic-bg)] text-[var(--type-epic-text)] dark:bg-[var(--type-epic-bg-dark)] dark:text-[var(--type-epic-text-dark)]";
  if (t === "event")
    return "bg-[var(--type-event-bg)] text-[var(--type-event-text)] dark:bg-[var(--type-event-bg-dark)] dark:text-[var(--type-event-text-dark)]";
  return "bg-[var(--surface-muted)] text-[var(--text)]";
}

export function typeHoverClasses(type: string): string {
  const t = type?.toLowerCase();
  if (t === "task" || t === "subtask")
    return "hover:bg-[var(--type-task-hover)] focus:bg-[var(--type-task-hover)] data-[state=checked]:bg-[var(--type-task-hover)]";
  if (t === "story") return "hover:bg-[var(--type-story-hover)] focus:bg-[var(--type-story-hover)] data-[state=checked]:bg-[var(--type-story-hover)]";
  if (t === "bug") return "hover:bg-[var(--type-bug-hover)] focus:bg-[var(--type-bug-hover)] data-[state=checked]:bg-[var(--type-bug-hover)]";
  if (t === "epic") return "hover:bg-[var(--type-epic-hover)] focus:bg-[var(--type-epic-hover)] data-[state=checked]:bg-[var(--type-epic-hover)]";
  if (t === "event") return "hover:bg-[var(--type-event-hover)] focus:bg-[var(--type-event-hover)] data-[state=checked]:bg-[var(--type-event-hover)]";
  return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
}
