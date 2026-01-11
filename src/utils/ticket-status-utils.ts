import type { TicketStatus } from "@/types/ticket";

export const STATUS_GROUPS = [
  {
    label: "To-do",
    statuses: ["Backlog", "Todo", "Blocked"] as TicketStatus[],
  },
  {
    label: "In progress",
    statuses: ["In Progress", "In Review", "Ongoing"] as TicketStatus[],
  },
  {
    label: "Complete",
    statuses: ["Done", "Removed"] as TicketStatus[],
  },
];

export function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    backlog: "Backlog",
    todo: "Todo",
    "in progress": "In Progress",
    "in review": "In Review",
    blocked: "Blocked",
    ongoing: "Ongoing",
    done: "Done",
    removed: "Removed",
  };
  return statusMap[status.toLowerCase()] || status;
}

export function statusPillClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "in progress" || s === "in review") return "bg-[var(--accent-soft)] text-[var(--accent)]";
  if (s === "todo" || s === "backlog") return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
  if (s === "blocked") return "border border-[var(--danger)] bg-transparent text-[var(--danger)]";
  if (s === "done") return "border border-[var(--success)] bg-transparent text-[var(--success)]";
  if (s === "ongoing") return "bg-[var(--accent-meeting-soft)] text-[var(--accent-meeting)]";
  if (s === "removed") return "bg-[var(--surface-muted)] text-[var(--text-muted)] opacity-60";
  return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
}

export function statusHoverClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "in progress" || s === "in review")
    return "hover:bg-[var(--accent-subtle)] focus:bg-[var(--accent-subtle)] data-[state=checked]:bg-[var(--accent-subtle)]";
  if (s === "todo" || s === "backlog")
    return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
  if (s === "blocked")
    return "hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 data-[state=checked]:bg-red-50 dark:data-[state=checked]:bg-red-950/30";
  if (s === "done")
    return "hover:bg-green-50 dark:hover:bg-green-950/30 focus:bg-green-50 dark:focus:bg-green-950/30 data-[state=checked]:bg-green-50 dark:data-[state=checked]:bg-green-950/30";
  if (s === "ongoing")
    return "hover:bg-[var(--accent-meeting-soft)] focus:bg-[var(--accent-meeting-soft)] data-[state=checked]:bg-[var(--accent-meeting-soft)]";
  if (s === "removed")
    return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
  return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
}
