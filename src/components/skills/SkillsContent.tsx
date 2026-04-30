"use client";

import type { ComponentType } from "react";
import { ArrowLeft, Puzzle } from "lucide-react";
import { Button } from "@/ui/button";
import { skillsRegistry } from "@/lib/skills-registry";
import type { RegisteredSkill } from "@/types/skill";

interface SkillsContentProps {
  selectedFocusId: string | null;
  selectedSkill: RegisteredSkill | null;
  onSkillSelect: (skill: RegisteredSkill) => void;
  onBack: () => void;
}

interface SkillCardProps {
  skill: RegisteredSkill;
  onClick: () => void;
}

function SkillCard({ skill, onClick }: SkillCardProps) {
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

/**
 * Skills content area.
 *
 * When no skill is selected: shows a grid of skill cards for the current focus.
 * When a skill is selected: renders the skill component with a back button.
 */
export function SkillsContent({ selectedFocusId, selectedSkill, onSkillSelect, onBack }: SkillsContentProps) {
  // If a skill is selected, render it
  if (selectedSkill) {
    const SkillComponent: ComponentType = selectedSkill.component;
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Back button header */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-sm font-medium text-[var(--text)]">{selectedSkill.config.name}</span>
        </div>

        {/* Skill component */}
        <div className="flex-1 overflow-auto">
          <SkillComponent />
        </div>
      </div>
    );
  }

  // No skill selected — show grid of skill cards
  const focus = skillsRegistry.find((f) => f.config.id === selectedFocusId) ?? skillsRegistry[0];
  const skills = focus?.skills ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <Puzzle className="h-5 w-5 text-[var(--accent)]" />
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">
            {focus ? focus.config.name : "Skills"}
          </h1>
          {focus?.config.description && (
            <p className="text-sm text-[var(--text-muted)]">{focus.config.description}</p>
          )}
        </div>
      </div>

      {/* Skill grid */}
      <div className="flex-1 overflow-auto p-6">
        {skills.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Puzzle className="h-10 w-10 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">No skills available for this focus.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((skill) => (
              <SkillCard key={skill.config.id} skill={skill} onClick={() => onSkillSelect(skill)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
