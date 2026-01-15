"use client";

import { Bug, Sparkles } from "lucide-react";
import { Card } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";

interface DebugAction {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface DebugSidebarProps {
  actions: DebugAction[];
}

/**
 * Temporary debug sidebar for testing and triggering modals/features.
 * TODO: Remove this component before production.
 */
export function DebugSidebar({ actions }: DebugSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-[var(--surface)]">
      {/* Header */}
      <div className="space-y-3 border-b border-[var(--border-subtle)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-[var(--warning)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">Debug Panel</h2>
          </div>
          <div className="bg-[var(--warning)]/10 rounded-full px-2 py-0.5 text-xs font-medium text-[var(--warning)]">DEV ONLY</div>
        </div>

        <p className="text-xs text-[var(--text-muted)]">Temporary testing panel. Trigger modals and features for development.</p>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="grid gap-3 pt-4">
          {actions.map((action) => (
            <Card
              key={action.id}
              className="group cursor-pointer border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3 transition-all hover:border-[var(--accent)] hover:shadow-md"
              onClick={action.onClick}
            >
              <div className="flex items-start gap-3">
                <div className="bg-[var(--accent)]/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                  {action.icon || <Sparkles className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-medium text-[var(--text)]">{action.label}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {actions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bug className="mb-3 h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">No debug actions configured</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
