"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck01, Home03, Lightbulb02, Lightbulb04, Package, Plus, SearchLg, Target04, X } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Ticket } from "@/app/home-screen";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import TicketModal from "@/components/application/modals/TicketModal";
import { DefaultSkillsPage } from "@/components/application/skills/DefaultSkillsPage";
import { ObjectiveModal } from "@/components/application/skills/ObjectiveModal";
import { SkillGraph } from "@/components/application/skills/SkillGraph";
import { SkillModal } from "@/components/application/skills/SkillModal";
import { SkillTabs, Tab } from "@/components/application/skills/SkillTabs";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { MOCK_OBJECTIVES, MOCK_SKILLS, MOCK_STAGE_NODES } from "@/data/mock-skills";
import { MOCK_TICKETS_FOR_SKILLS } from "@/data/mock-tickets-skills";
import { Objective, Skill, SkillStageNode } from "@/types/skills";

const STORAGE_KEY = "skills-page-tabs";

export default function SkillsPage() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
    const [selectedStage, setSelectedStage] = useState<SkillStageNode | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Load tabs from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const { tabs: storedTabs, activeTabId: storedActiveTabId } = JSON.parse(stored);
                // Reconstruct tabs with actual data from mock data
                const reconstructedTabs: Tab[] = storedTabs
                    .map((tab: { id: string; type: "skill" | "objective" }) => {
                        if (tab.type === "skill") {
                            const skill = MOCK_SKILLS.find((s) => s.skill_id === tab.id);
                            return skill ? { id: tab.id, type: "skill" as const, data: skill } : null;
                        } else {
                            const objective = MOCK_OBJECTIVES.find((o) => o.skill_id === tab.id);
                            return objective ? { id: tab.id, type: "objective" as const, data: objective } : null;
                        }
                    })
                    .filter((tab: Tab | null): tab is Tab => tab !== null);

                if (reconstructedTabs.length > 0) {
                    setTabs(reconstructedTabs);
                    // Only set active tab if it exists in reconstructed tabs
                    if (storedActiveTabId && reconstructedTabs.some((tab) => tab.id === storedActiveTabId)) {
                        setActiveTabId(storedActiveTabId);
                    } else {
                        setActiveTabId(reconstructedTabs[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load tabs from local storage:", error);
        }
    }, []);

    // Save tabs to local storage whenever they change
    useEffect(() => {
        try {
            const toStore = {
                tabs: tabs.map((tab) => ({ id: tab.id, type: tab.type })),
                activeTabId,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
        } catch (error) {
            console.error("Failed to save tabs to local storage:", error);
        }
    }, [tabs, activeTabId]);

    const openSkillTab = (skill: Skill) => {
        const existingTab = tabs.find((tab) => tab.id === skill.skill_id);
        if (existingTab) {
            setActiveTabId(skill.skill_id);
        } else {
            const newTab: Tab = {
                id: skill.skill_id,
                type: "skill",
                data: skill,
            };
            setTabs([...tabs, newTab]);
            setActiveTabId(skill.skill_id);
        }
    };

    const openObjectiveTab = (objective: Objective) => {
        const existingTab = tabs.find((tab) => tab.id === objective.skill_id);
        if (existingTab) {
            setActiveTabId(objective.skill_id);
        } else {
            const newTab: Tab = {
                id: objective.skill_id,
                type: "objective",
                data: objective,
            };
            setTabs([...tabs, newTab]);
            setActiveTabId(objective.skill_id);
        }
    };

    const handleTabClose = (tabId: string) => {
        const newTabs = tabs.filter((tab) => tab.id !== tabId);
        setTabs(newTabs);
        if (activeTabId === tabId) {
            setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
        }
    };

    const handleSkillClick = (skill: Skill) => {
        setSelectedSkill(skill);
        setSkillModalOpen(true);
    };

    const handleObjectiveClick = (objective: Objective) => {
        setSelectedObjective(objective);
        setObjectiveModalOpen(true);
    };

    const handleStageClick = (stage: SkillStageNode) => {
        // TODO: Implement stage modal if needed
        console.log("Stage clicked:", stage);
    };

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setTicketModalOpen(true);
    };

    const handleTicketClickFromSkillModal = (ticketId: string) => {
        const ticket = MOCK_TICKETS_FOR_SKILLS.find((t) => t.ticket_id === ticketId);
        if (ticket) {
            setSkillModalOpen(false);
            handleTicketClick(ticket);
        }
    };

    const handleTicketClickFromObjectiveModal = (ticketId: string) => {
        const ticket = MOCK_TICKETS_FOR_SKILLS.find((t) => t.ticket_id === ticketId);
        if (ticket) {
            setObjectiveModalOpen(false);
            handleTicketClick(ticket);
        }
    };

    const handleAddTicketToStage = (stageId: string) => {
        // TODO: Implement ticket selection/creation modal
        console.log("Add ticket to stage:", stageId);
        alert(
            `Add ticket functionality for stage ${stageId}\n\nThis would open a modal to:\n- Select existing tickets\n- Create a new ticket linked to this stage`,
        );
    };

    const handleAddTicketToObjective = (objectiveId: string) => {
        // TODO: Implement ticket selection/creation modal
        console.log("Add ticket to objective:", objectiveId);
        alert(
            `Add ticket functionality for objective ${objectiveId}\n\nThis would open a modal to:\n- Select existing tickets\n- Create a new ticket linked to this objective`,
        );
    };

    const handleCreateSkill = () => {
        // TODO: Implement skill creation modal
        console.log("Create new skill");
        alert("Create new skill functionality\n\nThis would open a modal to create a new mastery skill");
    };

    const handleCreateObjective = () => {
        // TODO: Implement objective creation modal
        console.log("Create new objective");
        alert("Create new objective functionality\n\nThis would open a modal to create a new objective");
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // TODO: Implement search/filter functionality
        console.log("Searching for:", query);
    };

    const toggleSearch = () => {
        setSearchOpen(!searchOpen);
    };

    // Handle click outside to close search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        };

        if (searchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Focus the input when opened
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchOpen]);

    return (
        <div className="flex h-screen flex-col bg-white">
            {/* Navigation */}
            <SidebarNavigationSlim
                activeUrl="/skills"
                items={[
                    { label: "Home", icon: Home03, href: "/" },
                    { label: "Planner", icon: CalendarCheck01, href: "/planner" },
                    { label: "Projects", icon: Package, href: "/projects" },
                    { label: "Skills", icon: Lightbulb04, href: "/skills" },
                ]}
            />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden" style={{ marginLeft: "72px" }}>
                {/* Tabs */}
                <SkillTabs
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabClick={setActiveTabId}
                    onTabClose={handleTabClose}
                    onNewTab={() => setActiveTabId(null)}
                />

                {/* Graph container */}
                <div className="relative flex-1 overflow-hidden bg-white">
                    {activeTabId === null ? (
                        // Default page with carousels
                        <DefaultSkillsPage
                            skills={MOCK_SKILLS}
                            objectives={MOCK_OBJECTIVES}
                            onSkillClick={openSkillTab}
                            onObjectiveClick={openObjectiveTab}
                            onCreateSkill={handleCreateSkill}
                            onCreateObjective={handleCreateObjective}
                        />
                    ) : (
                        <>
                            {/* Floating toolbar - top right */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    {/* Add dropdown button */}
                                    <Dropdown.Root>
                                        <AriaButton
                                            className="flex size-9 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50"
                                            aria-label="Add"
                                        >
                                            <Plus className="size-4.5 text-gray-700" />
                                        </AriaButton>

                                        <Dropdown.Popover placement="bottom end">
                                            <Dropdown.Menu>
                                                <Dropdown.Section>
                                                    <Dropdown.Item icon={Lightbulb02} onAction={handleCreateSkill}>
                                                        New Skill
                                                    </Dropdown.Item>
                                                    <Dropdown.Item icon={Target04} onAction={handleCreateObjective}>
                                                        New Objective
                                                    </Dropdown.Item>
                                                </Dropdown.Section>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown.Root>

                                    {/* Search button */}
                                    <div ref={searchContainerRef} className="relative">
                                        <button
                                            onClick={toggleSearch}
                                            className="flex size-9 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50"
                                            title="Search"
                                        >
                                            <SearchLg className="size-4.5 text-gray-700" />
                                        </button>

                                        {/* Search dropdown */}
                                        {searchOpen && (
                                            <div className="absolute top-11 right-0 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                                                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
                                                    <SearchLg className="size-4 text-gray-400" />
                                                    <input
                                                        ref={searchInputRef}
                                                        type="text"
                                                        placeholder="Search skills and objectives..."
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearch(e.target.value)}
                                                        className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(() => {
                                const activeTab = tabs.find((tab) => tab.id === activeTabId);
                                if (!activeTab) return null;

                                if (activeTab.type === "skill") {
                                    const skill = activeTab.data as Skill;
                                    const relatedStageNodes = MOCK_STAGE_NODES.filter((stage) => skill.connected_stage_ids.includes(stage.stage_node_id));
                                    const relatedTicketIds = new Set(relatedStageNodes.flatMap((stage) => stage.connected_ticket_ids));
                                    const relatedTickets = MOCK_TICKETS_FOR_SKILLS.filter((ticket) => relatedTicketIds.has(ticket.ticket_id));

                                    return (
                                        <SkillGraph
                                            key={skill.skill_id}
                                            skills={[skill]}
                                            objectives={[]}
                                            stageNodes={relatedStageNodes}
                                            tickets={relatedTickets}
                                            onSkillClick={handleSkillClick}
                                            onObjectiveClick={handleObjectiveClick}
                                            onStageClick={handleStageClick}
                                            onTicketClick={handleTicketClick}
                                            onAddTicketToStage={handleAddTicketToStage}
                                            onAddTicketToObjective={handleAddTicketToObjective}
                                            blobsEnabled={false}
                                        />
                                    );
                                } else {
                                    const objective = activeTab.data as Objective;
                                    const relatedTickets = MOCK_TICKETS_FOR_SKILLS.filter((ticket) =>
                                        objective.connected_ticket_ids.includes(ticket.ticket_id),
                                    );

                                    return (
                                        <SkillGraph
                                            key={objective.skill_id}
                                            skills={[]}
                                            objectives={[objective]}
                                            stageNodes={[]}
                                            tickets={relatedTickets}
                                            onSkillClick={handleSkillClick}
                                            onObjectiveClick={handleObjectiveClick}
                                            onStageClick={handleStageClick}
                                            onTicketClick={handleTicketClick}
                                            onAddTicketToStage={handleAddTicketToStage}
                                            onAddTicketToObjective={handleAddTicketToObjective}
                                            blobsEnabled={false}
                                        />
                                    );
                                }
                            })()}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            <SkillModal open={skillModalOpen} skill={selectedSkill} onClose={() => setSkillModalOpen(false)} onTicketClick={handleTicketClickFromSkillModal} />

            <ObjectiveModal
                open={objectiveModalOpen}
                objective={selectedObjective}
                onClose={() => setObjectiveModalOpen(false)}
                onTicketClick={handleTicketClickFromObjectiveModal}
            />

            <TicketModal open={ticketModalOpen} ticketId={selectedTicket?.ticket_id || null} onClose={() => setTicketModalOpen(false)} />
        </div>
    );
}
