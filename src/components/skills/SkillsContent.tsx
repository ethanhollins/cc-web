"use client";

import type { ComponentType } from "react";
import { ArrowLeft, Puzzle } from "lucide-react";
import { SkillCard } from "@/components/skills/SkillCard";
import { Button } from "@/ui/button";
import { skillsRegistry } from "@/lib/skills-registry";
import type { RegisteredSkill } from "@/types/skill";

interface SkillsContentProps {
  selectedProjectId: string | null;
  selectedSkill: RegisteredSkill | null;
  onSkillSelect: (skill: RegisteredSkill) => void;
  onBack: () => void;
}

/**
 * Skills content area.
 *
 * When no skill is selected: shows a grid of skill cards for the current focus.
 * When a skill is selected: renders the skill component with a back button.
 */
export function SkillsContent({ selectedProjectId, selectedSkill, onSkillSelect, onBack }: SkillsContentProps) {
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
  const focus = selectedProjectId ? skillsRegistry.find((f) => f.config.project_id === selectedProjectId) : undefined;
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
