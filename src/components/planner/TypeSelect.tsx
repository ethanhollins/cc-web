"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TicketType } from "@/types/ticket";
import { PillSelect } from "@/ui/pill-select";
import { TYPE_OPTIONS, getTypeDisplayName, typeHoverClasses, typePillClasses } from "@/utils/ticket-type-utils";

interface TypeSelectProps {
  type: TicketType;
  onTypeChange: (newType: TicketType) => void;
  className?: string;
}

export function TypeSelect({ type, onTypeChange, className }: TypeSelectProps) {
  return (
    <PillSelect
      value={type}
      onChange={onTypeChange}
      groups={[{ label: "Ticket Type", options: TYPE_OPTIONS }]}
      getPillClasses={typePillClasses}
      getHoverClasses={typeHoverClasses}
      getDisplayName={getTypeDisplayName}
      align="start"
      className={cn("h-6 rounded-sm", className)}
      showShadow={false}
    />
  );
}
