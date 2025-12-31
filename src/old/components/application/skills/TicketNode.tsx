import React from "react";
import { CheckCircle, CheckDone02, CheckSquare, Circle, Diamond01, Feather, X } from "@untitledui/icons";
import { Handle, Position } from "reactflow";
import { Ticket, TicketType } from "@/old/app/home-screen";
import { TicketCriterionScore } from "@/old/types/skills";
import { getCriterionColor } from "@/old/utils/criterion-colors";

type TicketNodeProps = {
    data: Ticket & {
        criterionScores?: TicketCriterionScore[];
        onUnlink?: () => void;
    };
    selected?: boolean;
};

/**
 * Get ticket icon based on ticket type
 */
const getTicketIcon = (type: TicketType) => {
    const iconClass = "size-3.5";

    switch (type) {
        case "task":
            return <CheckSquare className={`${iconClass} text-blue-600`} />;
        case "story":
            return <Feather className={`${iconClass} text-green-600`} />;
        case "bug":
            return <Circle className={`${iconClass} text-red-600`} />;
        case "epic":
            return <Diamond01 className={`${iconClass} text-purple-600`} />;
        case "subtask":
            return <CheckCircle className={`${iconClass} text-cyan-600`} />;
        default:
            return <CheckDone02 className={`${iconClass} text-gray-600`} />;
    }
};

/**
 * Get ticket background color based on status
 */
const getTicketBgColor = (status: string) => {
    switch (status) {
        case "Done":
            return "bg-green-50 border-green-200";
        case "In Progress":
            return "bg-blue-50 border-blue-200";
        case "In Review":
            return "bg-purple-50 border-purple-200";
        case "Blocked":
            return "bg-red-50 border-red-200";
        case "Todo":
            return "bg-gray-50 border-gray-200";
        default:
            return "bg-white border-gray-200";
    }
};

/**
 * Ticket node component for the graph
 */
export const TicketNode: React.FC<TicketNodeProps> = ({ data, selected }) => {
    const criterionScores = data.criterionScores || [];

    return (
        <div className="relative">
            {/* Unlink button - appears in top right when selected */}
            {selected && data.onUnlink && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onUnlink?.();
                    }}
                    className="absolute -top-1 -right-1 z-10 flex size-6 items-center justify-center rounded-full border-2 border-red-300 bg-white shadow-md transition-all hover:border-red-600 hover:bg-red-50 hover:shadow-lg"
                    title="Unlink ticket"
                >
                    <X className="size-3.5 text-red-600" strokeWidth={2.5} />
                </button>
            )}

            <div
                className={`flex max-w-[200px] min-w-[160px] items-center gap-2 rounded-lg border-2 bg-white px-3 py-2 shadow-sm transition-all ${
                    selected ? "shadow-md ring-2 ring-gray-900 ring-offset-2" : ""
                } ${getTicketBgColor(data.ticket_status)}`}
            >
                {/* Ticket icon */}
                <div className="flex-shrink-0">{getTicketIcon(data.ticket_type)}</div>

                {/* Ticket info */}
                <div className="flex-1 overflow-hidden">
                    <div className="truncate text-xs font-semibold text-gray-900">{data.ticket_key}</div>
                    <div className="line-clamp-2 text-xs text-gray-600">{data.title}</div>
                </div>
            </div>

            {/* Score badges - positioned at bottom left */}
            {criterionScores.length > 0 && (
                <div className="absolute -bottom-2 left-0 flex gap-1">
                    {criterionScores.map((criterion) => {
                        const color = getCriterionColor(criterion.criterion_id);
                        return (
                            <div
                                key={criterion.criterion_id}
                                className="flex h-4 items-center justify-center rounded px-2 text-[10px] font-bold text-white shadow-sm"
                                style={{ backgroundColor: color }}
                                title={`${criterion.criterion_name}: ${criterion.score}`}
                            >
                                +{criterion.score}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* React Flow handles - invisible but still functional */}
            <Handle type="target" position={Position.Top} className="!opacity-0" />
            <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        </div>
    );
};
