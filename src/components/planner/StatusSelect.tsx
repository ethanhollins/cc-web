"use client";

import React from "react";
import type { TicketStatus } from "@/types/ticket";
import { PillSelect } from "@/ui/pill-select";
import { STATUS_GROUPS, getStatusDisplayName, statusHoverClasses, statusPillClasses } from "@/utils/ticket-status-utils";

interface StatusSelectProps {
  status: TicketStatus;
  onStatusChange: (newStatus: TicketStatus) => void;
  className?: string;
}

export function StatusSelect({ status, onStatusChange, className }: StatusSelectProps) {
  return (
    <PillSelect
      value={status}
      onChange={onStatusChange}
      groups={STATUS_GROUPS.map((group) => ({ label: group.label, options: group.statuses }))}
      getPillClasses={statusPillClasses}
      getHoverClasses={statusHoverClasses}
      getDisplayName={getStatusDisplayName}
      align="end"
      className={className}
    />
  );
}
