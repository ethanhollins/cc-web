"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface ProjectSelectProps {
  projectId: string | undefined;
  projects: Project[];
  onProjectChange: (projectId: string) => void;
  className?: string;
}

export function ProjectSelect({ projectId, projects, onProjectChange, className }: ProjectSelectProps) {
  const [optimisticProjectId, setOptimisticProjectId] = useState(projectId);

  // Sort projects alphabetically
  const sortedProjects = [...(projects || [])].sort((a, b) => a.title.localeCompare(b.title));

  // Sync optimistic value with prop changes (in case of API errors or external updates)
  useEffect(() => {
    setOptimisticProjectId(projectId);
  }, [projectId]);

  const getProject = (id: string | undefined) => {
    return projects?.find((p) => p.project_id === id) ?? null;
  };

  const getProjectTitle = (id: string | undefined) => {
    return getProject(id)?.title ?? "-";
  };

  // Use first project as default if no project selected
  const currentValue = optimisticProjectId || sortedProjects?.[0]?.project_id || "";

  const handleValueChange = (newValue: string) => {
    // Immediately update the UI optimistically
    setOptimisticProjectId(newValue);
    // Call the API in the background
    onProjectChange(newValue);
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-auto rounded-md border-0 px-2 py-1 text-sm font-medium shadow-none transition-colors hover:bg-[var(--surface-hover)] focus:ring-0 [&>svg]:hidden",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue>
          {currentValue ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full" style={{ backgroundColor: getProject(currentValue)?.colour || "#ffffff" }} />
              <span>{getProjectTitle(currentValue)}</span>
            </div>
          ) : (
            "-"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={cn("max-h-[300px] min-w-[180px] overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] py-2")}
        onClick={(e) => e.stopPropagation()}
      >
        {sortedProjects.map((project) => (
          <SelectItem
            key={project.project_id}
            value={project.project_id}
            className="my-1 cursor-pointer rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--surface-hover)] focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full" style={{ backgroundColor: project.colour || "#ffffff" }} />
              <span>{project.title}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
