import React from "react";
import { Check, Plus } from "@untitledui/icons";
import { Handle, Position } from "reactflow";
import { SkillStage, SkillStageNode } from "@/types/skills";
import { StageIcon } from "./StageIcons";

type StageNodeProps = {
    data: SkillStageNode & {
        onAddTicket?: () => void;
        scores?: Array<{ criterion_id: string; score: number }>;
    };
    selected?: boolean;
};

/**
 * Get color based on stage
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
 * Stage node component for the graph
 */
export const StageNode: React.FC<StageNodeProps> = ({ data, selected }) => {
    const progress = data.progress;
    const isCompleted = progress >= 100;
    const nodeSize = 80;
    const strokeWidth = 3;
    const borderRadius = 12; // matches rounded-xl
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
    const stageColor = getStageColor(data.stage);

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
                    className="absolute -top-1 -right-1 z-10 flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-md transition-all hover:border-gray-600 hover:bg-gray-50 hover:shadow-lg"
                    style={{ borderColor: stageColor }}
                    title="Add linked ticket"
                >
                    <Plus className="size-4" style={{ color: stageColor }} />
                </button>
            )}

            {/* Main node */}
            <div
                className={`relative flex size-[80px] flex-col items-center justify-center rounded-xl bg-white shadow-lg transition-all ${
                    selected ? "border-2 border-gray-900 shadow-xl" : "border-3 border-white"
                }`}
                style={{
                    borderColor: selected ? "#111827" : "white",
                }}
            >
                {/* Completion badge - appears in top left when complete */}
                {isCompleted && (
                    <div
                        className="absolute -top-1.5 -left-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-white shadow-md"
                        style={{ backgroundColor: stageColor }}
                    >
                        <Check className="size-4 text-white" strokeWidth={3} />
                    </div>
                )}

                {/* Stage icon */}
                <div className="mb-0.5" style={{ color: stageColor }}>
                    <StageIcon stage={data.stage} className="size-6" />
                </div>

                {/* Stage name */}
                <div className="max-w-[70px] text-center text-[10px] leading-tight font-semibold text-gray-900">{data.name}</div>

                {/* Progress percentage */}
                <div className="mt-0.5 text-[9px] font-medium text-gray-500">{Math.round(progress)}%</div>
            </div>

            {/* React Flow handles */}
            <Handle type="target" position={Position.Left} className="!border-0 !bg-transparent" />
            <Handle type="source" position={Position.Right} className="!border-0 !bg-transparent" />
        </div>
    );
};
