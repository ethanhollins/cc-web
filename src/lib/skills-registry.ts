"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMicroSkills } from "@/api/micro-skills";
import type { RegisteredSkill } from "@/types/skill";
import { skillConfig as dailyJournalConfig } from "../../skills/daily-journal/skill.config";
import DailyJournalSkill from "../../skills/daily-journal/Skill";

const localSkillMap: Record<string, Omit<RegisteredSkill, "id" | "projectId">> = {
  "daily-journal": {
    config: dailyJournalConfig,
    component: DailyJournalSkill,
  },
};

let cachedSkills: RegisteredSkill[] | null = null;
let inFlightSkillsRequest: Promise<RegisteredSkill[]> | null = null;

async function loadRegisteredSkills(): Promise<RegisteredSkill[]> {
  if (cachedSkills) {
    return cachedSkills;
  }

  if (inFlightSkillsRequest) {
    return inFlightSkillsRequest;
  }

  inFlightSkillsRequest = fetchMicroSkills()
    .then((apiSkills) =>
      apiSkills
        .map((apiSkill) => {
          const localSkill = localSkillMap[apiSkill.skill_id];
          if (!localSkill) return null;

          return {
            id: apiSkill.skill_id,
            projectId: apiSkill.project_id,
            component: localSkill.component,
            config: {
              ...localSkill.config,
              id: apiSkill.skill_id,
              name: apiSkill.name || localSkill.config.name,
              description: apiSkill.description ?? localSkill.config.description,
            },
          } satisfies RegisteredSkill;
        })
        .filter((skill): skill is RegisteredSkill => skill !== null),
    )
    .then((registered) => {
      cachedSkills = registered;
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
      } catch {
        if (!cancelled) {
          console.error("Failed to load skills registry from /micro-skills");
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
