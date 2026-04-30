import type { ComponentType } from "react";

/**
 * Skill type definitions
 */

/** Configuration for a focus (group of related skills). Lives in /skills/<focus>/focus.config.ts */
export interface FocusConfig {
  /** Unique identifier for the focus (matches the folder name) */
  id: string;
  /** Display name for the focus */
  name: string;
  /** Associated project ID in the main application */
  project_id?: string;
  /** Optional description of this focus area */
  description?: string;
}

/** Configuration for an individual skill. Lives in /skills/<focus>/<skill>/skill.config.ts */
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
  config: SkillConfig;
  component: ComponentType;
}

/** A focus registered in the skills registry */
export interface RegisteredFocus {
  config: FocusConfig;
  skills: RegisteredSkill[];
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
