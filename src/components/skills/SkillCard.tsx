"use client";

import { Puzzle } from "lucide-react";
import type { RegisteredSkill } from "@/types/skill";

interface SkillCardProps {
  skill: RegisteredSkill;
  onClick: () => void;
}

/**
 * Card component representing a single skill in the skills grid.
 * Displays the skill name, description and tags.
 */
export function SkillCard({ skill, onClick }: SkillCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)] hover:shadow-md"
    >
      {/* Icon area */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
        <Puzzle className="h-5 w-5 text-[var(--accent)]" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">{skill.config.name}</p>
        {skill.config.description && (
          <p className="line-clamp-3 text-xs text-[var(--text-muted)]">{skill.config.description}</p>
        )}
      </div>

      {/* Tags */}
      {skill.config.tags && skill.config.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.config.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
