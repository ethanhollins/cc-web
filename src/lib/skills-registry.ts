"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMicroSkills } from "@/api/micro-skills";
import type { RegisteredSkill } from "@/types/skill";
import DailyJournalSkill from "../../skills/daily-journal/Skill";
import { skillConfig as dailyJournalConfig } from "../../skills/daily-journal/skill.config";
import { poolTrainingSkillMap } from "../../skills/pool-training.registry";

const localSkillMap: Record<string, Omit<RegisteredSkill, "id" | "projectId">> = {
  "daily-journal": {
    config: dailyJournalConfig,
    component: DailyJournalSkill,
  },
  ...poolTrainingSkillMap,
};

let cachedSkills: RegisteredSkill[] | null = null;
let cachedSkillsAt = 0;
let inFlightSkillsRequest: Promise<RegisteredSkill[]> | null = null;
const SKILLS_CACHE_TTL_MS = 60000;

async function loadRegisteredSkills(): Promise<RegisteredSkill[]> {
  if (cachedSkills && Date.now() - cachedSkillsAt < SKILLS_CACHE_TTL_MS) {
    return cachedSkills;
  }

  if (inFlightSkillsRequest) {
    return inFlightSkillsRequest;
  }

  inFlightSkillsRequest = fetchMicroSkills()
    .then((apiSkills): RegisteredSkill[] =>
      apiSkills.flatMap((apiSkill) => {
        const localSkill = localSkillMap[apiSkill.skill_id];
        if (!localSkill) {
          console.warn(`Micro-skill "${apiSkill.skill_id}" has no local implementation folder`);
          return [];
        }

        return [
          {
            id: apiSkill.skill_id,
            projectId: apiSkill.project_id,
            component: localSkill.component,
            config: {
              ...localSkill.config,
              id: apiSkill.skill_id,
              name: apiSkill.name || localSkill.config.name,
              description: apiSkill.description ?? localSkill.config.description,
            },
          } satisfies RegisteredSkill,
        ];
      }),
    )
    .then((registered) => {
      cachedSkills = registered;
      cachedSkillsAt = Date.now();
      return registered;
    })
    .finally(() => {
      inFlightSkillsRequest = null;
    });

  return inFlightSkillsRequest;
}

export function useSkillsRegistry() {
  const [skills, setSkills] = useState<RegisteredSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const registered = await loadRegisteredSkills();
        if (cancelled) return;

        setSkills(registered);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load skills registry from /micro-skills", error);
          setSkills([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const skillsByProjectId = useMemo(() => {
    return skills.reduce<Record<string, RegisteredSkill[]>>((acc, skill) => {
      if (!acc[skill.projectId]) {
        acc[skill.projectId] = [];
      }
      acc[skill.projectId].push(skill);
      return acc;
    }, {});
  }, [skills]);

  return {
    skills,
    skillsByProjectId,
    isLoading,
  };
}
