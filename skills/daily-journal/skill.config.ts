import type { SkillConfig } from "@/types/skill";

/**
 * Skill configuration for the "Daily Journal" skill.
 *
 * The Daily Journal skill lets you write and persist daily notes directly
 * inside the planner, linked to the current focus area.
 */
export const skillConfig: SkillConfig = {
  id: "daily-journal",
  name: "Daily Journal",
  description: "Write and persist daily notes linked to your focus area.",
  icon: "BookOpen",
  version: "1.0.0",
  author: "cc-web",
  tags: ["notes", "journaling", "productivity"],
};
