"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PillSelect } from "@/ui/pill-select";

const STATUS_GROUPS = [
  {
    label: "To-do",
    options: ["inactive", "backlog", "not started"],
  },
  {
    label: "In progress",
    options: ["in progress"],
  },
  {
    label: "Complete",
    options: ["done", "archived"],
  },
];

interface FocusStatusSelectProps {
  status: string | undefined;
  onStatusChange: (newStatus: string) => void;
  className?: string;
}

const getDisplayName = (status: string): string => {
  // Capitalize first letter of each word
  return status
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusPillClasses = (status: string): string => {
  const normalized = status?.toLowerCase();
  if (["done", "archived"].includes(normalized)) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  }
  if (normalized === "in progress") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

const getStatusHoverClasses = (status: string): string => {
  const normalized = status?.toLowerCase();
  if (["done", "archived"].includes(normalized)) {
    return "hover:bg-green-50 dark:hover:bg-green-900/20";
  }
  if (normalized === "in progress") {
    return "hover:bg-blue-50 dark:hover:bg-blue-900/20";
  }
  return "hover:bg-gray-50 dark:hover:bg-gray-800";
};

export function FocusStatusSelect({ status, onStatusChange, className }: FocusStatusSelectProps) {
  return (
    <PillSelect
      value={status || "not started"}
      onChange={onStatusChange}
      groups={STATUS_GROUPS}
      getPillClasses={getStatusPillClasses}
      getHoverClasses={getStatusHoverClasses}
      getDisplayName={getDisplayName}
      align="end"
      className={cn("h-6 rounded-full", className)}
    />
  );
}
