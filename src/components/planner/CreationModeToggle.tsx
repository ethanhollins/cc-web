"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type CreationMode = "ticket" | "focus" | "break" | "marker";

interface CreationModeToggleProps {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  disabled?: boolean;
  hasTimeRange?: boolean;
}

/**
 * Toggle component for switching between Ticket, Focus, Break and Marker creation modes
 * Displays as a pill with sides that flip highlight on click
 */
export function CreationModeToggle({ mode, onModeChange: _onModeChange, disabled = false, hasTimeRange = false }: CreationModeToggleProps) {
  const isBreakDisabled = disabled || !hasTimeRange;
  const isMarkerDisabled = disabled || !hasTimeRange;

  return (
    <div className={cn("inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] p-0.5", disabled && "cursor-not-allowed opacity-50")}>
      <button
        type="button"
        onClick={() => _onModeChange("ticket")}
        disabled={disabled}
        className={`min-w-[50px] rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
          mode === "ticket" ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        Ticket
      </button>
      <button
        type="button"
        onClick={() => _onModeChange("focus")}
        disabled={disabled}
        className={`min-w-[50px] rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
          mode === "focus"
            ? "bg-purple-100 text-purple-600 shadow-sm dark:bg-purple-950 dark:text-purple-400"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        Focus
      </button>
      <button
        type="button"
        onClick={() => _onModeChange("break")}
        disabled={isBreakDisabled}
        className={cn(
          "min-w-[50px] rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200",
          mode === "break" ? "bg-gray-200 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300" : "text-[var(--text-muted)] hover:text-[var(--text)]",
          isBreakDisabled && "cursor-not-allowed opacity-50",
        )}
      >
        Break
      </button>
      <button
        type="button"
        onClick={() => _onModeChange("marker")}
        disabled={isMarkerDisabled}
        className={cn(
          "min-w-[50px] rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200",
          mode === "marker"
            ? "bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-950 dark:text-blue-400"
            : "text-[var(--text-muted)] hover:text-[var(--text)]",
          isMarkerDisabled && "cursor-not-allowed opacity-50",
        )}
      >
        Marker
      </button>
    </div>
  );
}
