"use client";

import { Lightbulb04, Target04 } from "@untitledui/icons";
import { Objective, Skill } from "@/old/types/skills";
import { AddCard, ObjectiveCard, SkillCard } from "./SkillCards";

type DefaultSkillsPageProps = {
    skills: Skill[];
    objectives: Objective[];
    onSkillClick: (skill: Skill) => void;
    onObjectiveClick: (objective: Objective) => void;
    onCreateSkill: () => void;
    onCreateObjective: () => void;
};

export function DefaultSkillsPage({ skills, objectives, onSkillClick, onObjectiveClick, onCreateSkill, onCreateObjective }: DefaultSkillsPageProps) {
    return (
        <div className="flex h-full items-center justify-center overflow-y-auto bg-white p-8">
            <div className="w-full max-w-6xl space-y-12">
                {/* Mastery Skills Section */}
                <div>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
                            <Lightbulb04 className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Mastery Skills</h2>
                            <p className="text-sm text-gray-600">Long-term skills with progressive stages</p>
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                        {skills.map((skill) => (
                            <SkillCard key={skill.skill_id} skill={skill} onClick={() => onSkillClick(skill)} />
                        ))}
                        <AddCard type="skill" onClick={onCreateSkill} />
                    </div>
                </div>

                {/* Objectives Section */}
                <div>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                            <Target04 className="size-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Objectives</h2>
                            <p className="text-sm text-gray-600">Single-stage goals with specific outcomes</p>
                        </div>
                    </div>

                    {/* Carousel */}
                    <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                        {objectives.map((objective) => (
                            <ObjectiveCard key={objective.skill_id} objective={objective} onClick={() => onObjectiveClick(objective)} />
                        ))}
                        <AddCard type="objective" onClick={onCreateObjective} />
                    </div>
                </div>
            </div>
        </div>
    );
}
