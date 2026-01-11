"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/types/ticket";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";
import { STATUS_GROUPS, statusHoverClasses, statusPillClasses } from "@/utils/ticket-status-utils";

interface StatusSelectProps {
  status: TicketStatus;
  onStatusChange: (newStatus: TicketStatus) => void;
}

export function StatusSelect({ status, onStatusChange }: StatusSelectProps) {
  const handleChange = (newStatus: string) => {
    if (newStatus !== status) {
      onStatusChange(newStatus as TicketStatus);
    }
  };

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger
        className={cn("h-auto w-auto rounded-full border-0 px-2 py-0.5 text-xs font-semibold [&>svg]:hidden", statusPillClasses(status))}
        onClick={(e) => e.stopPropagation()}
      >
        {status}
      </SelectTrigger>
      <SelectContent
        align="end"
        className="min-w-[180px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            {groupIndex > 0 && <div className="my-2 h-px bg-[var(--border-subtle)]" />}
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{group.label}</div>
            {group.statuses.map((statusOption) => (
              <SelectItem
                key={statusOption}
                value={statusOption}
                className={cn("my-1 cursor-pointer rounded-md px-2 py-1 transition-colors focus:outline-none", statusHoverClasses(statusOption))}
              >
                <span className={cn("inline-block w-fit rounded-full px-3 py-0.5 text-xs font-semibold", statusPillClasses(statusOption))}>{statusOption}</span>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
