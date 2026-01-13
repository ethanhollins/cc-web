"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useEpics } from "@/hooks/useEpics";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface EpicSelectProps {
  epicId: string | undefined;
  tickets: Ticket[];
  projectId?: string;
  onEpicChange: (epicId: string | null) => void;
  className?: string;
  placeholder?: string;
}

export function EpicSelect({ epicId, tickets, projectId, onEpicChange, className, placeholder = "-" }: EpicSelectProps) {
  const [optimisticEpicId, setOptimisticEpicId] = useState(epicId);
  const { epics } = useEpics(tickets, projectId);

  // Sort epics alphabetically
  const sortedEpics = [...epics].sort((a, b) => a.title.localeCompare(b.title));

  // Sync optimistic value with prop changes (in case of API errors or external updates)
  useEffect(() => {
    setOptimisticEpicId(epicId);
  }, [epicId]);

  const getEpic = (id: string | undefined) => {
    if (!id) return null;
    return epics.find((t) => t.ticket_id === id || t.notion_id === id) ?? null;
  };

  const getEpicTitle = (id: string | undefined) => {
    if (!id) return placeholder;
    return getEpic(id)?.title ?? placeholder;
  };

  const handleValueChange = (newValue: string) => {
    // Immediately update the UI optimistically
    setOptimisticEpicId(newValue);
    // Call the API in the background
    onEpicChange(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticEpicId("");
    onEpicChange(null);
  };

  return (
    <div className="relative inline-flex items-center">
      <Select value={optimisticEpicId || "__none__"} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            "h-auto w-auto max-w-[200px] rounded-md border-0 px-2 py-1 text-sm font-medium shadow-none transition-colors hover:bg-[var(--surface-hover)] focus:ring-0 [&>svg]:hidden",
            optimisticEpicId && "pr-8",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue>
            {optimisticEpicId ? (
              <div className="flex max-w-full items-center gap-2 overflow-hidden pr-3">
                {getEpic(optimisticEpicId)?.colour && (
                  <div className="h-4 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: getEpic(optimisticEpicId)?.colour }} />
                )}
                <span className="truncate">{getEpicTitle(optimisticEpicId)}</span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className={cn("max-h-[300px] min-w-[180px] overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2")}
          onClick={(e) => e.stopPropagation()}
        >
          {sortedEpics.map((ticket) => (
            <SelectItem
              key={ticket.ticket_id}
              value={ticket.ticket_id}
              className="my-1 cursor-pointer rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--surface-hover)] focus:outline-none"
            >
              <div className="flex items-center gap-2">
                {ticket.colour && <div className="h-4 w-1 rounded-full" style={{ backgroundColor: ticket.colour }} />}
                <span>{ticket.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {optimisticEpicId && (
        <button
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm opacity-50 transition-opacity hover:opacity-100"
          aria-label="Clear epic"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
