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
  const t = type.toLowerCase();
  if (t === "task" || t === "subtask") return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  if (t === "story") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (t === "bug") return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
  if (t === "epic") return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
  if (t === "event") return "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400";
  return "bg-[var(--surface-muted)] text-[var(--text)]";
}

export function typeHoverClasses(type: string): string {
  const t = type.toLowerCase();
  if (t === "task" || t === "subtask")
    return "hover:bg-blue-50 dark:hover:bg-blue-950/30 focus:bg-blue-50 dark:focus:bg-blue-950/30 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:bg-blue-950/30";
  if (t === "story")
    return "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 data-[state=checked]:bg-emerald-50 dark:data-[state=checked]:bg-emerald-950/30";
  if (t === "bug")
    return "hover:bg-rose-50 dark:hover:bg-rose-950/30 focus:bg-rose-50 dark:focus:bg-rose-950/30 data-[state=checked]:bg-rose-50 dark:data-[state=checked]:bg-rose-950/30";
  if (t === "epic")
    return "hover:bg-purple-50 dark:hover:bg-purple-950/30 focus:bg-purple-50 dark:focus:bg-purple-950/30 data-[state=checked]:bg-purple-50 dark:data-[state=checked]:bg-purple-950/30";
  if (t === "event")
    return "hover:bg-gray-50 dark:hover:bg-gray-900/30 focus:bg-gray-50 dark:focus:bg-gray-900/30 data-[state=checked]:bg-gray-50 dark:data-[state=checked]:bg-gray-900/30";
  return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
}
