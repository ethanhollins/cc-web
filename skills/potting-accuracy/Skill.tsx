"use client";

import { useMemo, useState } from "react";
import { getFocusData, listSkillData, setFocusData, setSkillData } from "@skills-api";
import type { SkillDataRecord } from "@skills-api";
import { ListChecks, TrendingUp } from "lucide-react";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { type BallCountOption, type SpreadOption, pottingAccuracyDrillConfig } from "./drills/potting-accuracy-drill.config";
import { calculateElo } from "./utils/calculate-elo";

interface PottingAccuracySkillProps {
  skillId?: string;
  projectId?: string;
}

interface AttemptStats {
  balls_potted: number;
  total_balls: BallCountOption;
  cleared: boolean;
}

type AttemptRecord = SkillDataRecord & {
  skill_key: string;
  drill_key: string;
  timestamp: string;
  elo_delta: number;
  effective_drill_elo: number;
  score: number;
  stats: AttemptStats;
};

type SkillSummaryRecord = SkillDataRecord & {
  skill_key: string;
  current_elo: number;
  total_attempt_count: number;
  last_attempt_at: string;
};

type FocusSessionRecord = SkillDataRecord & {
  date: string;
  total_elo_earned: number;
  attempt_count: number;
};

const DEFAULT_SKILL_ID = "potting_accuracy";
const DEFAULT_PLAYER_ELO = 1200;

function getTimestampId() {
  return `attempt:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function getRelativeTime(timestamp: string): string {
  const elapsedMs = Date.now() - new Date(timestamp).getTime();
  const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1000));

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} sec${elapsedSeconds === 1 ? "" : "s"} ago`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function isAttemptRecord(row: SkillDataRecord, skillId: string, drillKey: string): row is AttemptRecord {
  if (typeof row.id !== "string") return false;
  if (typeof row.timestamp !== "string") return false;
  if (row.skill_key !== skillId) return false;
  if (row.drill_key !== drillKey) return false;
  if (typeof row.elo_delta !== "number") return false;
  if (typeof row.effective_drill_elo !== "number") return false;
  if (typeof row.score !== "number") return false;
  if (typeof row.stats !== "object" || row.stats === null) return false;

  const stats = row.stats as Record<string, unknown>;
  return (
    typeof stats.balls_potted === "number" &&
    typeof stats.total_balls === "number" &&
    typeof stats.cleared === "boolean" &&
    (stats.total_balls === 3 || stats.total_balls === 5 || stats.total_balls === 8)
  );
}

export default function PottingAccuracySkill({ skillId = DEFAULT_SKILL_ID, projectId }: PottingAccuracySkillProps) {
  const [selectedDrillKey, setSelectedDrillKey] = useState<string | null>(null);
  const [selectedTierLabel, setSelectedTierLabel] = useState(pottingAccuracyDrillConfig.tiers[0].label);
  const [ballCount, setBallCount] = useState<BallCountOption>(5);
  const [spread, setSpread] = useState<SpreadOption>("standard");
  const [ballsPotted, setBallsPotted] = useState(0);
  const [playerElo, setPlayerElo] = useState(DEFAULT_PLAYER_ELO);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<AttemptRecord[]>([]);

  const selectedTier = useMemo(
    () => pottingAccuracyDrillConfig.tiers.find((tier) => tier.label === selectedTierLabel) ?? pottingAccuracyDrillConfig.tiers[0],
    [selectedTierLabel],
  );
  const selectedBallAdjustment = useMemo(
    () => pottingAccuracyDrillConfig.ballCountAdjustments.find((option) => option.value === ballCount) ?? pottingAccuracyDrillConfig.ballCountAdjustments[0],
    [ballCount],
  );
  const selectedSpreadAdjustment = useMemo(
    () => pottingAccuracyDrillConfig.spreadAdjustments.find((option) => option.value === spread) ?? pottingAccuracyDrillConfig.spreadAdjustments[0],
    [spread],
  );

  const effectiveDrillElo = selectedTier.baseElo + selectedBallAdjustment.eloModifier + selectedSpreadAdjustment.eloModifier;

  async function refreshRecentAttempts() {
    const rows = await listSkillData(skillId);

    const attempts = rows
      .filter((row): row is AttemptRecord => isAttemptRecord(row, skillId, pottingAccuracyDrillConfig.drillKey))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    setRecentAttempts(attempts);
  }

  async function refreshSummary() {
    const summaryRow = await listSkillData(skillId).then((rows) => rows.find((row) => row.id === `skill-summary:${skillId}`));

    if (!summaryRow) {
      setPlayerElo(DEFAULT_PLAYER_ELO);
      setAttemptCount(0);
      return;
    }

    const currentElo = typeof summaryRow.current_elo === "number" ? summaryRow.current_elo : DEFAULT_PLAYER_ELO;
    const totalAttempts = typeof summaryRow.total_attempt_count === "number" ? summaryRow.total_attempt_count : 0;

    setPlayerElo(currentElo);
    setAttemptCount(totalAttempts);
  }

  async function openDrill(drillKey: string) {
    setSelectedDrillKey(drillKey);
    setBallsPotted(0);
    await Promise.all([refreshSummary(), refreshRecentAttempts()]);
  }

  async function recordAttempt(cleared: boolean) {
    const totalBalls = ballCount;
    const potted = cleared ? totalBalls : ballsPotted;
    const score = potted / totalBalls;
    const timestamp = new Date().toISOString();

    const elo = calculateElo(playerElo, effectiveDrillElo, score, attemptCount);

    const attempt: AttemptRecord = {
      id: getTimestampId(),
      skill_key: skillId,
      drill_key: pottingAccuracyDrillConfig.drillKey,
      timestamp,
      elo_delta: elo.delta,
      effective_drill_elo: effectiveDrillElo,
      score,
      stats: {
        balls_potted: potted,
        total_balls: totalBalls,
        cleared,
      },
    };

    const summary: SkillSummaryRecord = {
      id: `skill-summary:${skillId}`,
      skill_key: skillId,
      current_elo: elo.newElo,
      total_attempt_count: attemptCount + 1,
      last_attempt_at: timestamp,
    };

    setIsSubmitting(true);
    try {
      await Promise.all([setSkillData(skillId, attempt), setSkillData(skillId, summary)]);

      if (projectId) {
        const date = timestamp.slice(0, 10);
        const sessionId = `focus-session:${date}`;
        const existingSession = await getFocusData(projectId, sessionId);

        const previousElo = typeof existingSession?.total_elo_earned === "number" ? existingSession.total_elo_earned : 0;
        const previousCount = typeof existingSession?.attempt_count === "number" ? existingSession.attempt_count : 0;

        const session: FocusSessionRecord = {
          id: sessionId,
          date,
          total_elo_earned: previousElo + elo.delta,
          attempt_count: previousCount + 1,
        };

        await setFocusData(projectId, session);
      }

      setPlayerElo(elo.newElo);
      setAttemptCount((value) => value + 1);
      setBallsPotted(0);
      await refreshRecentAttempts();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedDrillKey) {
    return (
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Potting Accuracy</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Select a drill to start logging your attempts.</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => void openDrill(pottingAccuracyDrillConfig.drillKey)}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-left shadow-sm transition-all hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]"
          >
            <p className="text-sm font-semibold text-[var(--text)]">{pottingAccuracyDrillConfig.displayName}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Base tier ELO + live settings modifiers</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Current Skill ELO</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{playerElo}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Effective Drill ELO</p>
          <p className="text-lg font-semibold text-[var(--text)]">{effectiveDrillElo}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {selectedTier.baseElo} base + {selectedBallAdjustment.eloModifier} + {selectedSpreadAdjustment.eloModifier}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold text-[var(--text)]">Setup</p>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
          {pottingAccuracyDrillConfig.setupInstructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Tier</p>
          <div className="flex flex-wrap gap-2">
            {pottingAccuracyDrillConfig.tiers.map((tier) => (
              <Button
                key={tier.label}
                variant={selectedTier.label === tier.label ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTierLabel(tier.label)}
              >
                {tier.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Ball Count</p>
          <div className="flex flex-wrap gap-2">
            {pottingAccuracyDrillConfig.ballCountAdjustments.map((option) => (
              <Button
                key={option.value}
                variant={ballCount === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setBallCount(option.value);
                  setBallsPotted((current) => Math.min(current, option.value));
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Spread</p>
          <div className="flex flex-wrap gap-2">
            {pottingAccuracyDrillConfig.spreadAdjustments.map((option) => (
              <Button key={option.value} variant={spread === option.value ? "default" : "outline"} size="sm" onClick={() => setSpread(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
        <p className="text-sm font-semibold text-[var(--text)]">Attempt Controls</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {ballsPotted} / {ballCount} potted
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button onClick={() => setBallsPotted((value) => Math.min(ballCount, value + 1))} disabled={ballsPotted >= ballCount || isSubmitting}>
            Pot Ball ({ballsPotted}/{ballCount})
          </Button>
          <Button variant="outline" onClick={() => void recordAttempt(false)} disabled={isSubmitting}>
            Miss — End Attempt
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setBallsPotted(ballCount);
              void recordAttempt(true);
            }}
            disabled={isSubmitting}
          >
            Cleared!
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold text-[var(--text)]">Recent Attempts</p>
        </div>

        <ScrollArea className="max-h-56">
          <div className="space-y-2">
            {recentAttempts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No attempts recorded yet.</p>
            ) : (
              recentAttempts.map((attempt) => {
                const deltaText = attempt.elo_delta > 0 ? `+${attempt.elo_delta}` : `${attempt.elo_delta}`;
                return (
                  <div
                    key={attempt.id}
                    className="flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-hover)] p-3 text-sm text-[var(--text)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-[var(--text-muted)]">{getRelativeTime(attempt.timestamp)}</span>
                    <span>
                      {attempt.stats.balls_potted} / {attempt.stats.total_balls} potted
                    </span>
                    <span className={attempt.elo_delta >= 0 ? "text-emerald-500" : "text-red-500"}>{deltaText} ELO</span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedDrillKey(null)}>
          Back to Drills
        </Button>
      </div>
    </div>
  );
}
