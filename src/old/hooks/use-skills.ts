/**
 * Hook for fetching and managing skills data
 */
import { useCallback, useEffect, useState } from "react";
import { Ticket } from "@/old/app/home-screen";
import { Objective, Skill, SkillStageNode } from "@/old/types/skills";
import { getAllSkills, getSkill, getSkillGraph } from "@/old/utils/skills-api";
import { GraphNodeAPI, transformSkillGraph } from "@/old/utils/transform-graph";
import { transformSkills } from "@/old/utils/transform-skills";

export function useSkills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSkills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllSkills();
            const transformed = transformSkills(response.skills);
            setSkills(transformed.skills);
            setObjectives(transformed.objectives);
        } catch (err) {
            console.error("Failed to fetch skills:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch skills");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    return {
        skills,
        objectives,
        isLoading,
        error,
        refetch: fetchSkills,
    };
}

export function useSkillGraph(skillId: string | null, skills: Skill[], objectives: Objective[]) {
    const [graphData, setGraphData] = useState<{
        skills: Skill[];
        objectives: Objective[];
        stageNodes: SkillStageNode[];
        tickets: Ticket[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGraph = useCallback(async () => {
        if (!skillId) {
            setGraphData(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await getSkillGraph(skillId);
            const transformed = transformSkillGraph(response.skill_graph.nodes, skills, objectives);
            setGraphData(transformed);
        } catch (err) {
            console.error("Failed to fetch skill graph:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch skill graph");
        } finally {
            setIsLoading(false);
        }
    }, [skillId, skills, objectives]);

    useEffect(() => {
        fetchGraph();
    }, [fetchGraph]);

    return {
        graphData,
        isLoading,
        error,
        refetch: fetchGraph,
    };
}
