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

export function statusPillClasses(status: string): string {
  if (status === "In Progress" || status === "In Review") return "bg-[var(--accent-soft)] text-[var(--accent)]";
  if (status === "Todo" || status === "Backlog") return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
  if (status === "Blocked") return "border border-[var(--danger)] bg-transparent text-[var(--danger)]";
  if (status === "Done") return "border border-[var(--success)] bg-transparent text-[var(--success)]";
  if (status === "Ongoing") return "bg-[var(--accent-meeting-soft)] text-[var(--accent-meeting)]";
  if (status === "Removed") return "bg-[var(--surface-muted)] text-[var(--text-muted)] opacity-60";
  return "bg-[var(--surface-muted)] text-[var(--text-muted)]";
}

export function statusHoverClasses(status: string): string {
  if (status === "In Progress" || status === "In Review")
    return "hover:bg-[var(--accent-subtle)] focus:bg-[var(--accent-subtle)] data-[state=checked]:bg-[var(--accent-subtle)]";
  if (status === "Todo" || status === "Backlog")
    return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
  if (status === "Blocked")
    return "hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 data-[state=checked]:bg-red-50 dark:data-[state=checked]:bg-red-950/30";
  if (status === "Done")
    return "hover:bg-green-50 dark:hover:bg-green-950/30 focus:bg-green-50 dark:focus:bg-green-950/30 data-[state=checked]:bg-green-50 dark:data-[state=checked]:bg-green-950/30";
  if (status === "Ongoing")
    return "hover:bg-[var(--accent-meeting-soft)] focus:bg-[var(--accent-meeting-soft)] data-[state=checked]:bg-[var(--accent-meeting-soft)]";
  if (status === "Removed")
    return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
  return "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800";
}
