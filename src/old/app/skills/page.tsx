"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck01, ChevronDown, Home03, Lightbulb02, Lightbulb04, Package, Plus, SearchLg, Target04, X } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Ticket } from "@/old/app/home-screen";
import { SidebarNavigationSlim } from "@/old/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import { CreateSkillModal } from "@/old/components/application/modals/CreateSkillModal";
import TicketModal from "@/old/components/application/modals/TicketModal";
import { DefaultSkillsPage } from "@/old/components/application/skills/DefaultSkillsPage";
import { ObjectiveModal } from "@/old/components/application/skills/ObjectiveModal";
import { SkillGraph } from "@/old/components/application/skills/SkillGraph";
import { SkillModal } from "@/old/components/application/skills/SkillModal";
import { SkillTabs, Tab } from "@/old/components/application/skills/SkillTabs";
import { StageIcon } from "@/old/components/application/skills/StageIcons";
import { Dropdown } from "@/old/components/base/dropdown/dropdown";
import { GmailIcon, GoogleChatIcon, JiraIcon, NBAIcon, NotionIcon, YouTubeIcon } from "@/old/components/foundations/external-app-icons";
import { useSkillGraph, useSkills } from "@/old/hooks/use-skills";
import { Objective, Skill, SkillStageNode } from "@/old/types/skills";
import { linkTicketToSkill, searchTickets, unlinkTicketFromSkill } from "@/old/utils/skills-api";

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
  const [createSkillModalOpen, setCreateSkillModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStageForSearch, setSelectedStageForSearch] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch skills and objectives from API
  const { skills, objectives, isLoading: isLoadingSkills, refetch: refetchSkills } = useSkills();

  // Fetch graph data for the active tab
  const { graphData, isLoading: isLoadingGraph, refetch: refetchGraph } = useSkillGraph(activeTabId, skills, objectives);

  // Load tabs from local storage on mount
  useEffect(() => {
    // Wait for skills to load before reconstructing tabs
    if (isLoadingSkills || (skills.length === 0 && objectives.length === 0)) {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { tabs: storedTabs, activeTabId: storedActiveTabId } = JSON.parse(stored);
        // Reconstruct tabs with actual data from API
        const reconstructedTabs: Tab[] = storedTabs
          .map((tab: { id: string; type: "skill" | "objective" }) => {
            if (tab.type === "skill") {
              const skill = skills.find((s) => s.skill_id === tab.id);
              return skill ? { id: tab.id, type: "skill" as const, data: skill } : null;
            } else {
              const objective = objectives.find((o) => o.skill_id === tab.id);
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
  }, [skills, objectives, isLoadingSkills]);

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
    const ticket = graphData?.tickets.find((t) => t.ticket_id === ticketId);
    if (ticket) {
      setSkillModalOpen(false);
      handleTicketClick(ticket);
    }
  };

  const handleTicketClickFromObjectiveModal = (ticketId: string) => {
    const ticket = graphData?.tickets.find((t) => t.ticket_id === ticketId);
    if (ticket) {
      setObjectiveModalOpen(false);
      handleTicketClick(ticket);
    }
  };

  const handleAddTicketToStage = (stageId: string) => {
    // Open search with the stage pre-selected
    setSelectedStageForSearch(stageId);
    setSearchOpen(true);
    // Focus the search input after a brief delay
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleAddTicketToObjective = (objectiveId: string) => {
    // TODO: Implement ticket selection/creation modal
    console.log("Add ticket to objective:", objectiveId);
    alert(
      `Add ticket functionality for objective ${objectiveId}\n\nThis would open a modal to:\n- Select existing tickets\n- Create a new ticket linked to this objective`,
    );
  };

  const handleUnlinkTicket = async (ticketId: string, skillId: string, stageNodeId: string) => {
    // Find the stage node to get the stage name
    const stageNode = graphData?.stageNodes.find((node) => node.stage_node_id === stageNodeId);
    if (!stageNode) {
      console.error("Stage node not found");
      alert("Failed to unlink ticket: Stage not found.");
      return;
    }

    try {
      await unlinkTicketFromSkill(skillId, stageNode.stage.toLowerCase(), ticketId);
      // Refetch graph data to update the UI
      await refetchSkills();
    } catch (error) {
      console.error("Failed to unlink ticket:", error);
      alert("Failed to unlink ticket. Please try again.");
    }
  };

  const handleCreateSkill = () => {
    setCreateSkillModalOpen(true);
  };

  const handleCreateObjective = () => {
    setCreateSkillModalOpen(true);
  };

  const handleSkillCreated = async (skillId: string) => {
    console.log("Skill created with ID:", skillId);
    // Refetch skills to include the newly created skill
    await refetchSkills();
  };

  // Calculate scores for the selected skill from its connected tickets
  const getSkillScores = (skillId: string) => {
    if (!graphData) return [];

    const scoreMap = new Map<string, { total: number; count: number }>();

    // Get all tickets connected to this skill's stages
    const connectedStages = graphData.stageNodes.filter((s) => s.skill_id === skillId);
    const allConnectedTicketIds = connectedStages.flatMap((s) => s.connected_ticket_ids);

    // Aggregate scores from all connected tickets
    allConnectedTicketIds.forEach((ticketId) => {
      const ticket = graphData.tickets.find((t) => t.ticket_id === ticketId);
      if (ticket && (ticket as any).criterionScores) {
        (ticket as any).criterionScores.forEach((cs: { criterion_id: string; score: number }) => {
          const existing = scoreMap.get(cs.criterion_id) || { total: 0, count: 0 };
          scoreMap.set(cs.criterion_id, {
            total: existing.total + cs.score,
            count: existing.count + 1,
          });
        });
      }
    });

    // Calculate averages and sort alphabetically by criterion_id
    return Array.from(scoreMap.entries())
      .map(([criterion_id, { total, count }]) => ({
        criterion_id,
        score: Math.round(total / count),
      }))
      .sort((a, b) => a.criterion_id.localeCompare(b.criterion_id));
  };

  const getObjectiveScores = (objectiveId: string) => {
    if (!graphData) return [];

    const scoreMap = new Map<string, { total: number; count: number }>();

    // Get the objective and its connected tickets
    const objective = graphData.objectives.find((o) => o.skill_id === objectiveId);
    if (!objective) return [];

    const connectedTicketIds = objective.connected_ticket_ids || [];

    // Aggregate scores from all connected tickets
    connectedTicketIds.forEach((ticketId) => {
      const ticket = graphData.tickets.find((t) => t.ticket_id === ticketId);
      if (ticket && (ticket as any).criterionScores) {
        (ticket as any).criterionScores.forEach((cs: { criterion_id: string; score: number }) => {
          const existing = scoreMap.get(cs.criterion_id) || { total: 0, count: 0 };
          scoreMap.set(cs.criterion_id, {
            total: existing.total + cs.score,
            count: existing.count + 1,
          });
        });
      }
    });

    // Calculate averages and sort alphabetically by criterion_id
    return Array.from(scoreMap.entries())
      .map(([criterion_id, { total, count }]) => ({
        criterion_id,
        score: Math.round(total / count),
      }))
      .sort((a, b) => a.criterion_id.localeCompare(b.criterion_id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear results if query is empty
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set searching state
    setIsSearching(true);

    // Debounce search by 1 second
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchTickets(query, 10);
        setSearchResults(results.tickets || []);
      } catch (error) {
        console.error("Failed to search tickets:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);
  };

  const toggleSearch = () => {
    const newOpen = !searchOpen;
    setSearchOpen(newOpen);

    // Set default stage to current stage when opening from toolbar
    if (newOpen && graphData) {
      const activeTab = tabs.find((tab) => tab.id === activeTabId);
      if (activeTab?.type === "skill") {
        const skill = activeTab.data as Skill;
        // Find the stage node that matches current_stage
        const currentStageNode = graphData.stageNodes.find((node) => node.stage === skill.current_stage);
        if (currentStageNode) {
          setSelectedStageForSearch(currentStageNode.stage_node_id);
        } else if (graphData.stageNodes.length > 0) {
          // Fallback to first stage if current stage not found
          setSelectedStageForSearch(graphData.stageNodes[0].stage_node_id);
        }
      } else if (activeTab?.type === "objective") {
        // For objectives, use "assessment" as the stage
        setSelectedStageForSearch("assessment");
      }
    }

    // Reset search state when closing
    if (!newOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setSelectedStageForSearch("");
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  };

  const handleLinkTicket = async (ticketId: string) => {
    if (!activeTabId || !selectedStageForSearch) {
      console.error("No active skill or stage selected");
      return;
    }

    let stageName: string;

    // Check if this is an objective (assessment stage)
    if (selectedStageForSearch === "assessment") {
      stageName = "assessment";
    } else {
      // Find the stage node to get the stage name for mastery skills
      const stageNode = graphData?.stageNodes.find((node) => node.stage_node_id === selectedStageForSearch);

      if (!stageNode) {
        console.error("Stage node not found");
        return;
      }

      stageName = stageNode.stage.toLowerCase();
    }

    try {
      await linkTicketToSkill({
        skill_id: activeTabId,
        stage_id: stageName, // Use lowercase stage name
        ticket_id: ticketId,
      });

      // Close search and reset
      toggleSearch();

      // Refresh graph data to show new ticket
      refetchGraph();
    } catch (error) {
      console.error("Failed to link ticket:", error);
    }
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
          { label: "", divider: true },
          {
            label: "KanBan Board",
            icon: NotionIcon,
            href: "https://www.notion.so/286836bccb7980ac9b4ec173aa78e908?v=288836bccb7980c591ac000c275133c6",
            external: true,
          },
          { label: "Google Chat", icon: GoogleChatIcon, href: "https://chat.google.com", external: true },
          { label: "Gmail", icon: GmailIcon, href: "googlegmail://", external: true },
          { label: "Jira", icon: JiraIcon, href: "jira://", external: true },
          { label: "YouTube", icon: YouTubeIcon, href: "https://www.youtube.com", external: true },
          { label: "NBA", icon: NBAIcon, href: "nbaapp://", external: true },
        ]}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden" style={{ marginLeft: "72px" }}>
        {/* Tabs */}
        <SkillTabs tabs={tabs} activeTabId={activeTabId} onTabClick={setActiveTabId} onTabClose={handleTabClose} onNewTab={() => setActiveTabId(null)} />

        {/* Graph container */}
        <div className="relative flex-1 overflow-hidden bg-white">
          {isLoadingSkills ? (
            // Loading state
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="border-t-primary-600 mb-4 inline-block size-12 animate-spin rounded-full border-4 border-gray-200"></div>
                <p className="text-sm text-gray-600">Loading skills...</p>
              </div>
            </div>
          ) : activeTabId === null ? (
            // Default page with carousels
            <DefaultSkillsPage
              skills={skills}
              objectives={objectives}
              onSkillClick={openSkillTab}
              onObjectiveClick={openObjectiveTab}
              onCreateSkill={handleCreateSkill}
              onCreateObjective={handleCreateObjective}
            />
          ) : (
            <>
              {/* Floating toolbar - top right */}
              <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
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
                      <div className="absolute right-0 top-11 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
                        {/* Search input */}
                        <div className="border-b border-gray-200 p-3">
                          <div className="mb-2 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
                            <SearchLg className="size-4 text-gray-400" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search tickets..."
                              value={searchQuery}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                            />
                          </div>

                          {/* Stage selection */}
                          {graphData && graphData.stageNodes && graphData.stageNodes.length > 0 && (
                            <div className="relative">
                              {selectedStageForSearch &&
                                (() => {
                                  const selectedNode = graphData.stageNodes.find((node) => node.stage_node_id === selectedStageForSearch);
                                  return selectedNode ? (
                                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                      <StageIcon stage={selectedNode.stage} className="size-4 text-gray-500" />
                                    </div>
                                  ) : null;
                                })()}
                              <select
                                value={selectedStageForSearch}
                                onChange={(e) => setSelectedStageForSearch(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-10 text-sm text-gray-700 shadow-sm outline-none transition hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                                style={{ paddingLeft: selectedStageForSearch ? "2.5rem" : "0.75rem" }}
                              >
                                <option value="">Select a stage...</option>
                                {graphData.stageNodes.map((stageNode) => (
                                  <option key={stageNode.stage_node_id} value={stageNode.stage_node_id}>
                                    {stageNode.name || stageNode.stage}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Search results */}
                        <div className="max-h-96 overflow-y-auto p-2">
                          {isSearching ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center">
                                <div className="border-t-primary-600 mb-2 inline-block size-6 animate-spin rounded-full border-2 border-gray-200"></div>
                                <p className="text-xs text-gray-600">Searching...</p>
                              </div>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="space-y-1">
                              {searchResults.map((ticket) => (
                                <div
                                  key={ticket.ticket_id}
                                  className="flex items-start justify-between gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500">{ticket.ticket_key}</span>
                                      {ticket.ticket_type && <span className="text-xs text-gray-400">{ticket.ticket_type}</span>}
                                    </div>
                                    <p className="truncate text-sm text-gray-900">{ticket.title}</p>
                                    {ticket.ticket_status && <span className="text-xs text-gray-500">{ticket.ticket_status}</span>}
                                  </div>
                                  <button
                                    onClick={() => handleLinkTicket(ticket.ticket_id)}
                                    disabled={!selectedStageForSearch}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Link to stage"
                                  >
                                    <Plus className="size-4 text-gray-700" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : searchQuery ? (
                            <div className="py-8 text-center">
                              <p className="text-sm text-gray-500">No tickets found</p>
                            </div>
                          ) : (
                            <div className="py-8 text-center">
                              <p className="text-sm text-gray-400">Type to search tickets</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(() => {
                const activeTab = tabs.find((tab) => tab.id === activeTabId);
                if (!activeTab) return null;

                // Show loading state while fetching graph data
                if (isLoadingGraph) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="border-t-primary-600 mb-4 inline-block size-12 animate-spin rounded-full border-4 border-gray-200"></div>
                        <p className="text-sm text-gray-600">Loading graph...</p>
                      </div>
                    </div>
                  );
                }

                // Use graph data if available, otherwise show empty graph
                if (!graphData) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-500">No graph data available</p>
                    </div>
                  );
                }

                return (
                  <SkillGraph
                    key={activeTab.id}
                    skills={graphData.skills}
                    objectives={graphData.objectives}
                    stageNodes={graphData.stageNodes}
                    tickets={graphData.tickets}
                    onSkillClick={handleSkillClick}
                    onObjectiveClick={handleObjectiveClick}
                    onStageClick={handleStageClick}
                    onTicketClick={handleTicketClick}
                    onAddTicketToStage={handleAddTicketToStage}
                    onAddTicketToObjective={handleAddTicketToObjective}
                    onUnlinkTicket={handleUnlinkTicket}
                    blobsEnabled={false}
                  />
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <SkillModal
        open={skillModalOpen}
        skill={selectedSkill}
        onClose={() => setSkillModalOpen(false)}
        onTicketClick={handleTicketClickFromSkillModal}
        calculatedScores={selectedSkill ? getSkillScores(selectedSkill.skill_id) : []}
      />

      <ObjectiveModal
        open={objectiveModalOpen}
        objective={selectedObjective}
        onClose={() => setObjectiveModalOpen(false)}
        onTicketClick={handleTicketClickFromObjectiveModal}
        calculatedScores={selectedObjective ? getObjectiveScores(selectedObjective.skill_id) : []}
      />

      <TicketModal open={ticketModalOpen} ticketId={selectedTicket?.ticket_id || null} onClose={() => setTicketModalOpen(false)} />

      <CreateSkillModal open={createSkillModalOpen} onClose={() => setCreateSkillModalOpen(false)} onSuccess={handleSkillCreated} />
    </div>
  );
}
