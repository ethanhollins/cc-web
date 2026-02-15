"use client";

import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { Project } from "@/types/project";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { weekOfMonth } from "@/utils/calendar-utils";

interface CalendarHeaderProps {
  title: string;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateSelect?: () => void;
  /**
   * Whether the current calendar view includes today's date.
   * When false, the Today button is rendered in a neutral style.
   */
  isTodayInRange?: boolean;
  // Focus filter props
  projects?: Project[];
  selectedFocusIds?: string[];
  onFocusFilterChange?: (focusIds: string[]) => void;
}

/**
 * Calendar Header with navigation controls
 * Matches old implementation design with date badge
 */
export function CalendarHeader({
  title,
  currentDate,
  onPrevious,
  onNext,
  onToday,
  isTodayInRange = true,
  projects = [],
  selectedFocusIds = [],
  onFocusFilterChange,
}: CalendarHeaderProps) {
  const month = currentDate.toLocaleString("en-US", { month: "long" });
  const monthShort = currentDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = currentDate.getDate();
  const wk = weekOfMonth(currentDate);

  const todayButtonClasses = isTodayInRange
    ? "h-9 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--text-on-accent)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)]"
    : "h-9 rounded-full bg-[var(--accent-subtle)] px-4 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]";

  // Get active projects only ("In Progress" status)
  const activeProjects = projects.filter((p) => p.project_status?.toLowerCase() === "in progress");
  const allProjectIds = activeProjects.map((p) => p.project_id);
  const isAllSelected = selectedFocusIds.length === 0 || selectedFocusIds.length === allProjectIds.length;

  const handleToggleFocus = (projectId: string) => {
    if (!onFocusFilterChange) return;

    // If all are selected (empty array), treat as if all IDs are in the array
    const currentSelection = selectedFocusIds.length === 0 ? allProjectIds : selectedFocusIds;
    const isSelected = currentSelection.includes(projectId);

    if (isSelected) {
      const newSelection = currentSelection.filter((id) => id !== projectId);
      // If deselecting the last one, show all
      onFocusFilterChange(newSelection.length === 0 ? [] : newSelection);
    } else {
      onFocusFilterChange([...currentSelection, projectId]);
    }
  };

  const handleSelectAll = () => {
    if (!onFocusFilterChange) return;
    onFocusFilterChange([]); // Empty array means show all
  };

  const handleClearAll = () => {
    if (!onFocusFilterChange) return;
    // Select just the first project to avoid showing nothing
    onFocusFilterChange(allProjectIds.length > 0 ? [allProjectIds[0]] : []);
  };

  return (
    <div className="flex items-center justify-between p-3 lg:p-4">
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Date badge */}
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-[var(--accent-soft)] bg-[var(--surface-elevated)] shadow-sm lg:h-16 lg:w-16">
          <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">{monthShort}</div>
          <div className="text-2xl font-semibold leading-none text-[var(--text)]">{day}</div>
          <div className="mt-1 h-1.5 w-8 rounded-full bg-[var(--accent)]" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[var(--text)] lg:text-2xl">{month}</span>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">Week {wk}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">{title}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Focus Filter Button */}
        {projects.length > 0 && onFocusFilterChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--accent-subtle)] px-3 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                aria-label="Filter by focus"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {!isAllSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-xs text-[var(--text-on-accent)]">
                    {selectedFocusIds.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-lg backdrop-blur-sm">
              <DropdownMenuLabel className="font-semibold text-[var(--text)]">Filter by Focus</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
              <div className="flex gap-2 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 flex-1 text-xs text-[var(--text)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                  onClick={handleSelectAll}
                  disabled={isAllSelected}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 flex-1 text-xs text-[var(--text)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
                  onClick={handleClearAll}
                  disabled={selectedFocusIds.length === 1}
                >
                  Clear All
                </Button>
              </div>
              <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
              <div className="max-h-[300px] overflow-y-auto">
                {activeProjects.map((project) => {
                  const isSelected = selectedFocusIds.length === 0 || selectedFocusIds.includes(project.project_id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={project.project_id}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleFocus(project.project_id)}
                      onSelect={(e) => e.preventDefault()}
                      className="text-[var(--text)] hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] data-[disabled]:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        {project.colour && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.colour }} />}
                        <span className="truncate">
                          {project.project_key} — {project.title}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--accent-subtle)] px-2 py-1">
          <Button
            variant="ghost"
            className="h-8 w-8 rounded-full border-0 px-0 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            onClick={onPrevious}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="ghost" className={todayButtonClasses} onClick={onToday}>
            Today
          </Button>

          <Button
            variant="ghost"
            className="h-8 w-8 rounded-full border-0 px-0 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            onClick={onNext}
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
