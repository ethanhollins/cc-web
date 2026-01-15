"use client";

import { CircleStar, Plus } from "lucide-react";
import Image from "next/image";
import { type CoachProfile, type CoachStat, type CoachYield, mockCoaches } from "@/api/mocks/coaches";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";

// Re-export types for backwards compatibility
export type { CoachProfile, CoachStat };
export type CoachYieldIcon = CoachYield;

function getStatGradient(value: number): string {
  // Map 0-100 into bands using theme tokens
  if (value >= 75) {
    // Very healthy: solid green
    return "linear-gradient(to right, var(--success), var(--success))";
  }
  if (value >= 50) {
    // Early warning: green to amber
    return "linear-gradient(to right, var(--success), var(--warning))";
  }
  if (value >= 25) {
    // Concerning: amber to red
    return "linear-gradient(to right, var(--warning), var(--danger))";
  }
  // Critical: solid red
  return "linear-gradient(to right, var(--danger), var(--danger))";
}

interface CoachStatBarProps {
  label: string;
  value: number;
}

function CoachStatBar({ label, value }: CoachStatBarProps) {
  const gradient = getStatGradient(value);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span>{label}</span>
        <span className="font-medium text-[var(--text)]">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div className="h-full w-full" style={{ backgroundImage: gradient }} />
      </div>
    </div>
  );
}

function CoachCard({ coach }: { coach: CoachProfile }) {
  const maxDomainsToShow = 2;
  const visibleDomains = coach.domains.slice(0, maxDomainsToShow);
  const remainingDomains = coach.domains.length - visibleDomains.length;

  const maxYieldsToShow = 4;
  const visibleYields = coach.yields.slice(0, maxYieldsToShow);
  const remainingYields = coach.yields.length - visibleYields.length;

  return (
    <button
      type="button"
      className="group w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:ring-offset-0"
      aria-label={`${coach.name} coach profile`}
    >
      <Card
        className={cn(
          "flex h-full min-h-[176px] flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3 shadow-sm transition-colors duration-150",
          "group-hover:border-[var(--accent)]",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="group-hover:scale-115 relative h-12 w-12 transform transition-transform duration-150 group-hover:-translate-y-[2px]">
            <div className="h-full w-full overflow-hidden rounded-xl">
              <Image src={coach.imageSrc} alt={coach.name} fill sizes="48px" className="object-contain" />
            </div>

            {typeof coach.notificationsCount === "number" && coach.notificationsCount > 0 && (
              <div className="absolute -left-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--danger)] px-[3px] text-[9px] font-semibold text-[var(--text-on-accent)] shadow-sm">
                {coach.notificationsCount}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="truncate text-sm font-semibold text-[var(--text)]">{coach.name}</div>
            <div className="truncate text-xs text-[var(--text-muted)]">{coach.title}</div>

            {/* Domains this coach monitors (project domains) */}
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              {visibleDomains.map((domain) => (
                <span
                  key={domain}
                  className="max-w-[80px] truncate rounded-full bg-[var(--surface-muted)] px-2 py-[2px] text-[9px] font-medium text-[var(--text-muted)]"
                >
                  {domain}
                </span>
              ))}
              {remainingDomains > 0 && <span className="text-[9px] font-medium text-[var(--text-muted)]">+{remainingDomains}</span>}
            </div>
          </div>
        </div>

        {/* Yields overview row (above stats) */}
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="pr-0.5 text-[10px] font-medium text-[var(--text-muted)]">Recent:</span>
            {visibleYields.map((yieldIcon) => (
              <div key={yieldIcon.id} className="mr-1 flex items-center gap-[2px] text-[10px] text-[var(--text-muted)]">
                <div className="relative h-4 w-4 overflow-hidden rounded-sm" title={yieldIcon.alt} aria-label={yieldIcon.alt}>
                  <Image src={yieldIcon.imageSrc} alt={yieldIcon.alt} fill sizes="20px" className="object-contain" />
                </div>
                <span className="text-xs font-bold">+{yieldIcon.count}</span>
              </div>
            ))}
          </div>
          {remainingYields > 0 && <span className="text-[10px] font-semibold text-[var(--text-muted)]">+{remainingYields}</span>}
        </div>

        <div className="space-y-1 pt-0.5">
          {coach.stats.map((stat) => (
            <CoachStatBar key={stat.id} label={stat.label} value={stat.value} />
          ))}
        </div>
      </Card>
    </button>
  );
}

export function CoachesSidebar() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 px-4 pb-4 sm:pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--planner-sidebar-icon-bg)] text-[var(--accent)] shadow-[var(--planner-sidebar-icon-shadow)]">
              <CircleStar className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)]">Coaches</h3>
          </div>

          <Button
            type="button"
            size="sm"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
          >
            <Plus className="h-3 w-3" />
            <span>New Coach</span>
          </Button>
        </div>

        <p className="text-xs text-[var(--text-muted)]">Quickly glance at how each coach feels about your recent commitments.</p>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="grid gap-3">
          {mockCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
