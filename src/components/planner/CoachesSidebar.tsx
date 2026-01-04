"use client";

import { CircleStar, Plus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";

export interface CoachStat {
  id: string;
  label: string;
  value: number; // 0 - 100
}

export interface CoachYieldIcon {
  id: string;
  alt: string;
  imageSrc: string;
  /** How many of this yield the user currently has with this coach. */
  count: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  title: string;
  imageSrc: string;
  /** Number of unread/active notifications for this coach. */
  notificationsCount?: number;
  /** Domains (projects) this coach monitors. */
  domains: string[];
  /**
   * Specific project titles this coach manages in the planner.
   * Used for calendar highlighting (coach lens) so that only
   * events for these projects remain at full opacity.
   */
  managedProjectTitles?: string[];
  /** Recent yield icons earned with this coach. */
  yields: CoachYieldIcon[];
  stats: CoachStat[];
}

export const MOCK_COACHES: CoachProfile[] = [
  {
    id: "zore",
    name: "Zore",
    title: "Training Coach",
    imageSrc: "/coaches/coach_zore.png",
    notificationsCount: 2,
    domains: ["Training", "Health", "Recovery"],
    managedProjectTitles: ["Command Center"],
    yields: [
      { id: "workouts", alt: "Workouts yield", imageSrc: "/coaches/workouts_yield.png", count: 10 },
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 4 },
      { id: "completion", alt: "Completion yield", imageSrc: "/coaches/completion_yield.png", count: 5 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 72 },
      { id: "momentum", label: "Momentum", value: 69 },
      { id: "responsiveness", label: "Responsiveness", value: 75 },
    ],
  },
  {
    id: "amari",
    name: "Amari",
    title: "Momentum Coach",
    imageSrc: "/coaches/coach_amari.png",
    notificationsCount: 3,
    domains: ["Momentum", "Deep Work"],
    yields: [
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 5 },
      { id: "words", alt: "Words yield", imageSrc: "/coaches/words_yield.png", count: 12 },
      { id: "combos", alt: "Combos yield", imageSrc: "/coaches/combos_yield.png", count: 3 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 86 },
      { id: "momentum", label: "Momentum", value: 78 },
      { id: "responsiveness", label: "Responsiveness", value: 92 },
    ],
  },
  {
    id: "moksha",
    name: "Moksha",
    title: "Deep Work Coach",
    imageSrc: "/coaches/coach_moksha.png",
    notificationsCount: 1,
    domains: ["Deep Work", "Reading"],
    yields: [
      { id: "books", alt: "Books read yield", imageSrc: "/coaches/books_read_yield.png", count: 4 },
      { id: "logged", alt: "Logged yield", imageSrc: "/coaches/logged_yield.png", count: 9 },
      { id: "mastery", alt: "Mastery yield", imageSrc: "/coaches/mastery_yield.png", count: 2 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 64 },
      { id: "momentum", label: "Momentum", value: 52 },
      { id: "responsiveness", label: "Responsiveness", value: 71 },
    ],
  },
  {
    id: "pingala",
    name: "Pingala",
    title: "Systems Coach",
    imageSrc: "/coaches/coach_pingala.png",
    notificationsCount: 0,
    domains: ["Systems", "Planning", "Execution"],
    yields: [
      { id: "completion", alt: "Completion yield", imageSrc: "/coaches/completion_yield.png", count: 7 },
      { id: "milestone", alt: "Milestone yield", imageSrc: "/coaches/milestone_yield.png", count: 3 },
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 6 },
      { id: "workouts", alt: "Workouts yield", imageSrc: "/coaches/workouts_yield.png", count: 2 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 93 },
      { id: "momentum", label: "Momentum", value: 88 },
      { id: "responsiveness", label: "Responsiveness", value: 80 },
    ],
  },
  {
    id: "wealthy",
    name: "Wealthy",
    title: "Wealth Coach",
    imageSrc: "/coaches/coach_wealthy.png",
    notificationsCount: 0,
    domains: ["Wealth", "Systems"],
    yields: [
      { id: "milestone", alt: "Milestone yield", imageSrc: "/coaches/milestone_yield.png", count: 2 },
      { id: "logged", alt: "Logged yield", imageSrc: "/coaches/logged_yield.png", count: 8 },
      { id: "combos", alt: "Combos yield", imageSrc: "/coaches/combos_yield.png", count: 1 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 58 },
      { id: "momentum", label: "Momentum", value: 47 },
      { id: "responsiveness", label: "Responsiveness", value: 62 },
    ],
  },
];

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
          {MOCK_COACHES.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
