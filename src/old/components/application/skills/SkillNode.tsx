import React from "react";
import { Plus } from "@untitledui/icons";
import { Handle, Position } from "reactflow";
import { Skill, SkillStage } from "@/types/skills";
import { StageIcon } from "./StageIcons";

type SkillNodeProps = {
    data: Skill & {
        onAddTicket?: () => void;
        scores?: Array<{ criterion_id: string; score: number }>;
    };
    selected?: boolean;
};

/**
 * Calculate overall progress across all stages
 * Uses the stage_progress values which have been recalculated based on actual criterion total_scores
 */
const calculateOverallProgress = (skill: Skill): number => {
    const stages: SkillStage[] = ["Foundation", "Practitioner", "Expert", "Authority", "Master"];
    const totalProgress = stages.reduce((sum, stage) => sum + skill.stage_progress[stage], 0);
    return totalProgress / stages.length;
};

/**
 * Get color based on current stage
 */
const getStageColor = (stage: SkillStage): string => {
    switch (stage) {
        case "Foundation":
            return "#6b7280"; // gray-500
        case "Practitioner":
            return "#3b82f6"; // blue-500
        case "Expert":
            return "#a855f7"; // purple-500
        case "Authority":
            return "#f59e0b"; // amber-500
        case "Master":
            return "#eab308"; // yellow-500
        default:
            return "#8b5cf6";
    }
};

/**
 * Skill node component for the graph
 */
export const SkillNode: React.FC<SkillNodeProps> = ({ data, selected }) => {
    const progress = calculateOverallProgress(data);
    const nodeSize = 104;
    const strokeWidth = 4;
    const borderRadius = 16; // matches rounded-2xl
    const gap = 4; // gap between node and progress ring
    const progressSize = nodeSize + gap * 2;
    const svgSize = progressSize + strokeWidth * 2;
    const offset = strokeWidth;

    // Create a path that starts at top center and goes clockwise
    const width = progressSize;
    const height = progressSize;
    const r = borderRadius;
    const x = offset;
    const y = offset;

    // Start at top center, go right, down, left, up back to start
    const pathData = `
        M ${x + width / 2} ${y}
        L ${x + width - r} ${y}
        Q ${x + width} ${y} ${x + width} ${y + r}
        L ${x + width} ${y + height - r}
        Q ${x + width} ${y + height} ${x + width - r} ${y + height}
        L ${x + r} ${y + height}
        Q ${x} ${y + height} ${x} ${y + height - r}
        L ${x} ${y + r}
        Q ${x} ${y} ${x + r} ${y}
        L ${x + width / 2} ${y}
    `;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData.trim());
    const pathLength = path.getTotalLength?.() || 2 * (progressSize - 2 * borderRadius) + 2 * Math.PI * borderRadius;
    const strokeDashoffset = pathLength - (progress / 100) * pathLength;
    const stageColor = getStageColor(data.current_stage);

    return (
        <div className="relative flex items-center justify-center">
            {/* Progress ring */}
            <svg className="absolute -z-10" width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow: "visible" }}>
                {/* Background rounded rect */}
                <rect
                    x={offset}
                    y={offset}
                    width={progressSize}
                    height={progressSize}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                {/* Progress path starting from top center */}
                <path
                    d={pathData.trim()}
                    fill="none"
                    stroke={stageColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                />
            </svg>

            {/* Add ticket button - appears in top right when selected */}
            {selected && data.onAddTicket && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onAddTicket?.();
                    }}
                    className="absolute -top-2 -right-2 z-10 flex size-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-md transition-all hover:border-gray-600 hover:bg-gray-50 hover:shadow-lg"
                    style={{ borderColor: stageColor }}
                    title="Add linked ticket"
                >
                    <Plus className="size-5" style={{ color: stageColor }} />
                </button>
            )}

            {/* Main node */}
            <div
                className={`relative flex size-[104px] flex-col items-center justify-center rounded-2xl bg-white shadow-lg transition-all ${
                    selected ? "border-2 border-gray-900 shadow-xl" : "border-4 border-white"
                }`}
                style={{
                    borderColor: selected ? "#111827" : "white",
                }}
            >
                {/* Stage icon */}
                <div className="mb-1" style={{ color: data.color || stageColor }}>
                    <StageIcon stage={data.current_stage} className="size-8" />
                </div>

                {/* Skill name */}
                <div className="max-w-[90px] text-center text-xs leading-tight font-semibold text-gray-900">{data.name.split(" ").slice(0, 2).join(" ")}</div>

                {/* Stage label */}
                <div className="mt-0.5 text-[10px] font-medium text-gray-500">{data.current_stage}</div>
            </div>

            {/* React Flow handles */}
            <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent" />
            <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent" />
        </div>
    );
};
