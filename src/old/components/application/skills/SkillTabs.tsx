"use client";

import { Plus, X } from "@untitledui/icons";
import { Objective, Skill } from "@/types/skills";

export type Tab = {
    id: string;
    type: "skill" | "objective";
    data: Skill | Objective;
};

type SkillTabsProps = {
    tabs: Tab[];
    activeTabId: string | null;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onNewTab: () => void;
};

export function SkillTabs({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }: SkillTabsProps) {
    return (
        <div className="relative flex items-end border-b border-gray-200 bg-gray-100 px-6">
            {/* Title */}
            <h1 className="mr-4 pt-3 pb-1 text-xl font-bold text-gray-900">Skills Development</h1>

            {/* Tabs container */}
            <div className="flex flex-1 items-end pb-0">
                <div className="scrollbar-hide flex items-end gap-1 overflow-x-auto">
                    {tabs.map((tab, index) => {
                        const isActive = tab.id === activeTabId;
                        return (
                            <div
                                key={tab.id}
                                className={`group relative flex items-center gap-2 px-4 transition-all ${
                                    isActive
                                        ? "z-10 -mb-px rounded-t-lg border-x border-t border-gray-200 bg-white pt-3 pb-2.5 shadow-sm"
                                        : "cursor-pointer rounded-t-lg bg-gray-200/60 px-4 pt-2.5 pb-2 hover:bg-gray-200"
                                }`}
                                style={{
                                    minWidth: "120px",
                                    maxWidth: "200px",
                                }}
                            >
                                <button onClick={() => onTabClick(tab.id)} className="flex flex-1 items-center gap-2 overflow-hidden text-sm font-medium">
                                    {/* Type indicator dot */}
                                    <div className={`size-2 flex-shrink-0 rounded-full ${tab.type === "skill" ? "bg-blue-500" : "bg-emerald-500"}`} />
                                    <span className={`truncate ${isActive ? "text-gray-900" : "text-gray-600"}`}>{tab.data.name}</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTabClose(tab.id);
                                    }}
                                    className={`flex size-5 flex-shrink-0 items-center justify-center rounded transition hover:bg-gray-300 ${isActive ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-600"}`}
                                    title="Close tab"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Plus button to open new tab / default page */}
                    <button
                        onClick={onNewTab}
                        className={`mb-1 ml-1 flex size-7 flex-shrink-0 items-center justify-center rounded-lg transition ${
                            activeTabId === null ? "bg-gray-300 text-gray-700" : "bg-gray-200/60 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        }`}
                        title="New tab"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
