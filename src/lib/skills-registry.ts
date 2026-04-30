/**
 * Skills Registry
 *
 * Static registry of all skills available in the application.
 * When a new skill is added under /skills/, it must also be registered here
 * so the application can discover and render it.
 *
 * Structure:
 *   Each entry is a RegisteredFocus containing the focus config and an array
 *   of RegisteredSkills. Each skill provides its config and the React component
 *   to render when the skill is selected.
 */

import type { RegisteredFocus } from "@/types/skill";

// Focus configs
import { focusConfig as exampleFocusConfig } from "../../skills/example-focus/focus.config";

// Skill configs + components
import { skillConfig as dailyJournalConfig } from "../../skills/example-focus/daily-journal/skill.config";
import DailyJournalSkill from "../../skills/example-focus/daily-journal/Skill";

/**
 * The complete list of registered focuses and their skills.
 * Add new focuses/skills here as they are created in the /skills/ folder.
 */
export const skillsRegistry: RegisteredFocus[] = [
  {
    config: exampleFocusConfig,
    skills: [
      {
        config: dailyJournalConfig,
        component: DailyJournalSkill,
      },
    ],
  },
];
