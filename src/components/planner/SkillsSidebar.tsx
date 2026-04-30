"use client";

import { ChevronDown, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import { skillsRegistry } from "@/lib/skills-registry";
import type { RegisteredFocus, RegisteredSkill } from "@/types/skill";
import { ScrollArea } from "@/ui/scroll-area";

interface SkillsSidebarProps {
  selectedFocusId: string | null;
  selectedSkillId: string | null;
  onFocusChange: (focusId: string) => void;
  onSkillSelect: (skill: RegisteredSkill) => void;
}

/**
 * Skills sidebar component.
 *
 * Displays a focus selector dropdown and a scrollable list of skill cards for
 * the selected focus. Mirrors the visual style of FocusesSidebar.
 */
export function SkillsSidebar({ selectedFocusId, selectedSkillId, onFocusChange, onSkillSelect }: SkillsSidebarProps) {
  const selectedFocus: RegisteredFocus | undefined = selectedFocusId
    ? skillsRegistry.find((f) => f.config.id === selectedFocusId)
    : skillsRegistry[0];

  const currentSkills = selectedFocus?.skills ?? [];

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-soft)]">
          <Puzzle className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text)]">Skills</h2>
      </div>

      {/* Focus selector */}
      <div className="relative">
        <select
          value={selectedFocus?.config.id ?? ""}
          onChange={(e) => onFocusChange(e.target.value)}
          className="w-full appearance-none truncate rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2 pl-3 pr-9 text-sm font-medium text-[var(--text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
        >
          {skillsRegistry.length === 0 && (
            <option value="">No focuses</option>
          )}
          {skillsRegistry.map((f) => (
            <option key={f.config.id} value={f.config.id}>
              {f.config.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      </div>

      {/* Skill list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 pr-1">
          {currentSkills.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">
              {!selectedFocusId ? "Select a focus" : "No skills available"}
            </div>
          ) : (
            currentSkills.map((skill) => {
              const isActive = skill.config.id === selectedSkillId;
              return (
                <button
                  key={skill.config.id}
                  onClick={() => onSkillSelect(skill)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-all duration-150",
                    isActive
                      ? "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent-soft)] hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <p className={cn("text-sm font-medium", isActive ? "text-[var(--accent)]" : "text-[var(--text)]")}>{skill.config.name}</p>
                  {skill.config.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">{skill.config.description}</p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
