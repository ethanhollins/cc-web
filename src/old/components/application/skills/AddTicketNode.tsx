import React from "react";
import { Plus } from "@untitledui/icons";
import { Handle, Position } from "reactflow";

type AddTicketNodeProps = {
    data: {
        onAdd: () => void;
    };
};

/**
 * Add ticket node component - appears when a skill is selected
 */
export const AddTicketNode: React.FC<AddTicketNodeProps> = ({ data }) => {
    return (
        <div className="relative">
            <button
                onClick={data.onAdd}
                className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-gray-400 bg-white shadow-md transition-all hover:border-gray-600 hover:bg-gray-50 hover:shadow-lg"
                title="Add linked ticket"
            >
                <Plus className="size-6 text-gray-600" />
            </button>

            {/* React Flow handles */}
            <Handle type="target" position={Position.Top} className="!border-0 !bg-transparent" />
            <Handle type="source" position={Position.Bottom} className="!border-0 !bg-transparent" />
        </div>
    );
};
