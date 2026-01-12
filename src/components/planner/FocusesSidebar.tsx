"use client";

import React, { useState } from "react";
import { ChevronDown, ClipboardList, Diamond, FolderKanban, Plus, Target } from "lucide-react";
import { TicketCard } from "@/components/planner/TicketCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import type { Ticket, TicketStatus } from "@/types/ticket";
import { ExpandingTabButton } from "@/ui/expanding-tab-button";
import { ScrollArea } from "@/ui/scroll-area";

interface FocusesSidebarProps {
  projects: Project[];
  tickets: Record<string, Ticket[]>;
  selectedProjectKey?: string;
  onProjectChange: (projectKey: string) => void;
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onProjectEdit?: (project: Project) => void;
}

type TabType = "epics" | "programs";

/**
 * Focuses sidebar component for managing projects (focuses) and epics
 * Mobile-optimized with larger touch targets
 */
export function FocusesSidebar({ projects, tickets, selectedProjectKey, onProjectChange, onTicketClick, onStatusChange, onProjectEdit }: FocusesSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("epics");
  // const [isCreateEpicModalOpen, setIsCreateEpicModalOpen] = useState(false); // TODO: Implement epic creation modal

  const currentTickets = React.useMemo(() => (selectedProjectKey ? tickets[selectedProjectKey] || [] : []), [selectedProjectKey, tickets]);

  // Filter for epic tickets only
  const epicTickets = React.useMemo(() => {
    return currentTickets.filter((t) => t.ticket_type?.toLowerCase() === "epic");
  }, [currentTickets]);

  const selectedProject = projects.find((p) => p.project_key === selectedProjectKey);

  const handleOpenCreateEpicModal = () => {
    if (!selectedProjectKey && projects.length === 0) return;
    // setIsCreateEpicModalOpen(true); // TODO: Implement epic creation modal
    console.log("Create epic modal not yet implemented");
  };

  const handleEditProject = () => {
    if (selectedProject) {
      onProjectEdit?.(selectedProject);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-3 border-b border-[var(--border-subtle)] px-4 pb-4 sm:pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--planner-sidebar-icon-bg)] text-[var(--accent)] shadow-[var(--planner-sidebar-icon-shadow)]">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Focuses</h2>
          </div>
          {selectedProject && (
            <button
              onClick={handleEditProject}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
              aria-label="Edit focus"
            >
              <FolderKanban className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Domain/Project selector */}
        <div className="relative">
          <select
            value={selectedProjectKey}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full appearance-none truncate rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2 pl-3 pr-9 text-sm font-medium text-[var(--text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          >
            {projects
              .filter((p) => p.project_status?.toLowerCase() === "in progress")
              .sort((a, b) => a.project_key.localeCompare(b.project_key))
              .map((p) => (
                <option key={`domain-${p.project_key}`} value={p.project_key}>
                  {p.project_key} — {p.title}
                </option>
              ))}
            {projects.length === 0 && (
              <option key="no-domains" value="">
                No focuses
              </option>
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          {/* Create epic button */}
          <button
            onClick={handleOpenCreateEpicModal}
            disabled={!selectedProjectKey}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              selectedProjectKey
                ? "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
                : "cursor-not-allowed bg-[var(--surface-hover)] text-[var(--text-muted)] opacity-50",
            )}
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Tab buttons - currently only epics */}
          <div className="flex items-center gap-1">
            <ExpandingTabButton
              icon={<Diamond className="h-3.5 w-3.5" />}
              label="Epics"
              isActive={activeTab === "epics"}
              onClick={() => setActiveTab("epics")}
              variant="purple"
              labelWidth="w-10"
            />
            <ExpandingTabButton
              icon={<ClipboardList className="h-3.5 w-3.5" />}
              label="Programs"
              isActive={activeTab === "programs"}
              onClick={() => setActiveTab("programs")}
              variant="blue"
              labelWidth="w-20"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="w-full space-y-2 overflow-x-hidden p-2">
          {activeTab === "epics" && (
            <>
              {epicTickets.length === 0 ? (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">{!selectedProjectKey ? "Select a focus" : "No epics available"}</div>
              ) : (
                epicTickets.map((epic) => {
                  const isDone = ["done", "removed"].includes(epic.ticket_status?.toLowerCase());
                  return (
                    <TicketCard
                      key={epic.ticket_id}
                      ticket={epic}
                      tickets={currentTickets}
                      isDone={isDone}
                      isEventToday={false}
                      eventTimeRange={null}
                      onTicketClick={onTicketClick}
                      onStatusChange={onStatusChange}
                    />
                  );
                })
              )}
            </>
          )}
          {activeTab === "programs" && <div className="p-4 text-center text-sm text-[var(--text-muted)]">Programs coming soon</div>}
        </div>
      </ScrollArea>

      {/* TODO: Add TicketCreateModal for epics when needed */}
    </div>
  );
}
