import type { ComponentType } from "react";

export interface SkillComponentProps {
  skillId?: string;
  projectId?: string;
}

/** Configuration for an individual skill. Lives in /skills/<skill>/skill.config.ts */
export interface SkillConfig {
  /** Unique identifier for the skill (matches the folder name) */
  id: string;
  /** Display name for the skill */
  name: string;
  /** Short description of what the skill does */
  description?: string;
  /** Lucide-react icon name to use for the skill card */
  icon?: string;
  /** Semantic version of the skill */
  version?: string;
  /** Author or team that owns the skill */
  author?: string;
  /** Tags for categorisation/search */
  tags?: string[];
}

/** A skill registered in the skills registry */
export interface RegisteredSkill {
  id: string;
  projectId: string;
  config: SkillConfig;
  component: ComponentType<SkillComponentProps>;
}

/** A micro-skill record returned by the backend */
export interface MicroSkill {
  skill_id: string;
  project_id: string;
  name: string;
  description?: string;
}

/** Persistent data record stored by a skill */
export interface SkillDataRecord {
  /** Required row identifier — the skill defines this */
  id: string;
  /** Flexible columns (NoSQL-style) */
  [key: string]: unknown;
}

/** Scope level for persistent skill data */
export type SkillDataScope = "global" | "focus" | "skill";
