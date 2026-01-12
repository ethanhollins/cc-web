"use client";

import { useEffect, useState } from "react";
import { FileStack, FileText, Plus, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updateProjectColor, updateProjectKey, updateProjectTitle } from "@/api/projects";
import type { Project } from "@/types/project";
import { ConfirmDialog } from "@/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { EditableInput, EditableSmallInput, EditableTextarea } from "@/ui/editable-field";
import { VerticalDotsMenu } from "@/ui/vertical-dots-menu";
import { FocusStatusSelect } from "../planner/FocusStatusSelect";

interface FocusModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onStatusChange?: (projectId: string, newStatus: string) => void;
  onProjectDelete?: (projectId: string) => void;
}

/**
 * Focus (Project) modal for viewing and editing focus properties
 * Similar structure to TicketModal with compact/full modes
 */
export function FocusModal({ open, onClose, project, onStatusChange, onProjectDelete }: FocusModalProps) {
  // State for tracking which sections are being added/edited
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingProjectKey, setIsEditingProjectKey] = useState(false);
  const [editedProjectKey, setEditedProjectKey] = useState("");
  const [isEditingColor, setIsEditingColor] = useState(false);
  const [editedColor, setEditedColor] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // For demo purposes, we'll use local state for description
  // In production, this would come from an API
  const [domainDescription, setDomainDescription] = useState("");
  const [domainDocuments] = useState<Array<{ notion_url: string; title: string }>>([]);

  const hasDescription = Boolean(domainDescription && domainDescription.trim().length > 0);
  const hasDocuments = domainDocuments.length > 0;

  // Compact mode: no description, no documents, and not in "adding" mode
  const isCompactMode = !hasDescription && !hasDocuments && !isAddingDescription && !isAddingDocument;

  // Initialize edited description when content loads or when adding description
  useEffect(() => {
    if (domainDescription !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedDescription(domainDescription || "");
    }
  }, [domainDescription]);

  // Initialize edited title when project changes
  useEffect(() => {
    if (project?.title) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedTitle(project.title);
    }
  }, [project?.title]);

  // Initialize edited project key when project changes
  useEffect(() => {
    if (project?.project_key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedProjectKey(project.project_key);
    }
  }, [project?.project_key]);

  // Initialize edited color when project changes
  useEffect(() => {
    if (project?.colour) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedColor(project.colour);
    }
  }, [project?.colour]);

  useEffect(() => {
    if (isAddingDescription && !hasDescription) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditingDescription(true);
    }
  }, [isAddingDescription, hasDescription]);

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange && project?.project_id) {
      onStatusChange(project.project_id, newStatus);
    }
  };

  const handleSaveDescription = async () => {
    if (!project?.project_id) return;

    try {
      // Optimistically update the content
      setDomainDescription(editedDescription);

      // Exit editing mode immediately for responsive UI
      setIsEditingDescription(false);
      setIsAddingDescription(false);

      // In production, this would be an API call to update project description
      // await updateProjectDescription(project.project_id, editedDescription);
    } catch (error) {
      console.error("Error updating description:", error);
      // Rollback to previous content on error
      setDomainDescription(domainDescription);
    }
  };

  const handleCancelDescription = () => {
    // Revert to original content
    setEditedDescription(domainDescription || "");
    setIsEditingDescription(false);

    // If there's no description, go back to compact mode
    if (!hasDescription) {
      setIsAddingDescription(false);
    }
  };

  const handleDescriptionClick = () => {
    if (hasDescription && !isEditingDescription) {
      setIsEditingDescription(true);
    }
  };

  const handleSaveTitle = async () => {
    if (!project?.project_id || !editedTitle.trim()) return;

    // Store previous title for rollback on error
    const previousTitle = project?.title;

    try {
      // Exit editing mode immediately for responsive UI
      setIsEditingTitle(false);

      // Make the API call
      await updateProjectTitle(project.project_id, editedTitle.trim());
    } catch (error) {
      console.error("Error updating title:", error);
      // Rollback to previous title on error
      if (previousTitle) {
        setEditedTitle(previousTitle);
      }
      // TODO: Show error toast/notification
    }
  };

  const handleCancelTitle = () => {
    // Revert to original title
    setEditedTitle(project?.title || "");
    setIsEditingTitle(false);
  };

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setIsEditingTitle(true);
    }
  };

  const handleSaveProjectKey = async () => {
    if (!project?.project_id || !editedProjectKey.trim()) return;

    // Validate: max 4 characters, uppercase
    const upperKey = editedProjectKey.toUpperCase().slice(0, 4);
    if (upperKey.length === 0) return;

    const previousKey = project?.project_key;

    try {
      setIsEditingProjectKey(false);
      setEditedProjectKey(upperKey);

      await updateProjectKey(project.project_id, upperKey);
    } catch (error) {
      console.error("Error updating project key:", error);
      if (previousKey) {
        setEditedProjectKey(previousKey);
      }
    }
  };

  const handleCancelProjectKey = () => {
    setEditedProjectKey(project?.project_key || "");
    setIsEditingProjectKey(false);
  };

  const handleSaveColor = async () => {
    if (!project?.project_id || !editedColor.trim()) return;

    // Validate hex color (with or without #)
    const hexPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const colorValue = editedColor.trim();

    if (!hexPattern.test(colorValue)) {
      // Invalid hex color, revert
      setEditedColor(project?.colour || "");
      setIsEditingColor(false);
      return;
    }

    // Ensure # prefix
    const formattedColor = colorValue.startsWith("#") ? colorValue : `#${colorValue}`;
    const previousColor = project?.colour;

    try {
      setIsEditingColor(false);
      setEditedColor(formattedColor);

      await updateProjectColor(project.project_id, formattedColor);
    } catch (error) {
      console.error("Error updating color:", error);
      if (previousColor) {
        setEditedColor(previousColor);
      }
    }
  };

  const handleCancelColor = () => {
    setEditedColor(project?.colour || "");
    setIsEditingColor(false);
  };

  const handleDeleteProject = async () => {
    if (!project?.project_id) return;

    try {
      // In production, call the API to delete project
      // await deleteProject(project.project_id);
      onClose();
      onProjectDelete?.(project.project_id);
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  const menuItems = [
    {
      label: "Permanently Delete",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "danger" as const,
      onClick: () => setShowDeleteConfirm(true),
    },
  ];

  if (!project) return null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Reset "adding" and "editing" states when modal closes
            setIsAddingDescription(false);
            setIsAddingDocument(false);
            setIsEditingDescription(false);
            setEditedDescription("");
            setIsEditingTitle(false);
            setEditedTitle("");
            setIsEditingProjectKey(false);
            setEditedProjectKey("");
            setIsEditingColor(false);
            setEditedColor("");
            onClose();
          }
        }}
      >
        <DialogContent
          className={`h-[100svh] max-h-[100svh] w-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-0 ${
            isCompactMode ? "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[420px]" : "max-w-[100vw] sm:h-auto sm:max-h-[92vh] sm:max-w-[920px]"
          } overflow-hidden [&>button]:hidden`}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          {isCompactMode ? (
            // COMPACT MODE: Single column
            <div className="flex h-full flex-col overflow-auto p-6">
              {/* Header row: type/key on left, status on right */}
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 items-center rounded-full bg-blue-100 px-3 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Focus
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div onClick={(e) => e.stopPropagation()}>
                    <FocusStatusSelect status={project.project_status} onStatusChange={handleStatusChange} />
                  </div>
                  <VerticalDotsMenu items={menuItems} />
                  <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              {isEditingTitle ? (
                <div className="mb-4">
                  <EditableInput
                    value={editedTitle}
                    onChange={setEditedTitle}
                    onSave={handleSaveTitle}
                    onCancel={handleCancelTitle}
                    placeholder="Enter focus title..."
                  />
                </div>
              ) : (
                <DialogTitle
                  onClick={handleTitleClick}
                  className="mb-4 cursor-pointer rounded-md p-2 text-xl font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
                >
                  {project.title}
                </DialogTitle>
              )}

              {/* Pill buttons to add content */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setIsAddingDescription(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <Plus className="h-3 w-3" />
                  <span>Description</span>
                </button>
                <button
                  onClick={() => setIsAddingDocument(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <Plus className="h-3 w-3" />
                  <span>Link Document</span>
                </button>
              </div>

              {/* Focus properties */}
              <div className="mb-4 rounded-md bg-[var(--surface-muted)] p-3 text-sm">
                {isEditingProjectKey ? (
                  <div className="mb-2">
                    <EditableSmallInput
                      value={editedProjectKey}
                      onChange={(value) => {
                        const sanitized = value
                          .replace(/[^A-Za-z]/g, "")
                          .toUpperCase()
                          .slice(0, 4);
                        setEditedProjectKey(sanitized);
                      }}
                      onSave={handleSaveProjectKey}
                      onCancel={handleCancelProjectKey}
                      placeholder="PROJ"
                      maxLength={4}
                      label="Project Key:"
                    />
                  </div>
                ) : (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">Project Key:</span>
                    <span
                      onClick={() => setIsEditingProjectKey(true)}
                      className="cursor-pointer truncate rounded-md p-1 font-mono text-xs text-[var(--text)] transition-colors hover:bg-[var(--surface-elevated)]"
                    >
                      {project.project_key}
                    </span>
                  </div>
                )}
                {isEditingColor ? (
                  <div>
                    <EditableSmallInput
                      value={editedColor}
                      onChange={setEditedColor}
                      onSave={handleSaveColor}
                      onCancel={handleCancelColor}
                      placeholder="#000000"
                      label="Colour:"
                    />
                  </div>
                ) : project.colour ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">Colour:</span>
                    <div
                      onClick={() => setIsEditingColor(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors hover:bg-[var(--surface-elevated)]"
                    >
                      <div className="h-4 w-4 rounded-sm border border-[var(--border-subtle)]" style={{ backgroundColor: project.colour }} />
                      <span className="font-mono text-xs text-[var(--text-muted)]">{project.colour}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Notes section */}
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--text-muted)]">Notes</h4>
                  <button className="flex items-center gap-1.5 rounded-md bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:cursor-pointer hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                    <span className="text-base leading-none">+</span>
                    <span>New Note</span>
                  </button>
                </div>
                <div className="text-xs text-[var(--text-muted)] opacity-60">No notes yet</div>
              </div>

              {/* Go to Notion */}
              {project.notion_id && (
                <div className="mt-auto">
                  <a
                    href={`https://www.notion.so/${project.notion_id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Go to Notion"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-subtle)]"
                  >
                    Go to Notion
                  </a>
                </div>
              )}
            </div>
          ) : (
            // FULL MODE: Two-column layout
            <div className="flex h-full flex-col md:flex-row">
              {/* Left: main focus content */}
              <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span className="inline-flex h-6 items-center rounded-full bg-blue-100 px-3 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Project
                  </span>
                  {project.project_key && (
                    <span className="inline-flex h-6 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-2 text-xs font-semibold text-[var(--text)]">
                      {project.project_key}
                    </span>
                  )}
                </div>

                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {isEditingTitle ? (
                      <EditableInput
                        value={editedTitle}
                        onChange={setEditedTitle}
                        onSave={handleSaveTitle}
                        onCancel={handleCancelTitle}
                        placeholder="Enter focus title..."
                      />
                    ) : (
                      <DialogTitle
                        onClick={handleTitleClick}
                        className="cursor-pointer truncate rounded-md p-2 text-xl font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"
                      >
                        {project.title}
                      </DialogTitle>
                    )}
                  </div>
                </div>

                {/* Description */}
                {(hasDescription || isAddingDescription) && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[var(--text-muted)]">Description</h4>
                    </div>
                    {isEditingDescription ? (
                      <EditableTextarea
                        value={editedDescription}
                        onChange={setEditedDescription}
                        onSave={handleSaveDescription}
                        onCancel={handleCancelDescription}
                        placeholder="Add a description..."
                      />
                    ) : hasDescription ? (
                      <div onClick={handleDescriptionClick} className="cursor-pointer rounded-md p-3 transition-colors hover:bg-[var(--surface-muted)]">
                        <div className="prose prose-sm max-w-none [&>*]:text-[var(--text)]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{domainDescription}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-center">
                        <FileText className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
                        <p className="text-sm text-[var(--text-muted)]">Add a description for this focus</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Related documents */}
                {(hasDocuments || isAddingDocument) && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[var(--text-muted)]">Related Documents</h4>
                      {isAddingDocument && !hasDocuments && (
                        <button onClick={() => setIsAddingDocument(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                          Cancel
                        </button>
                      )}
                    </div>
                    {hasDocuments ? (
                      <ul className="space-y-1.5">
                        {domainDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <FileStack className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                            <a
                              href={doc.notion_url}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-sm font-medium text-[var(--accent)] hover:underline"
                            >
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-center">
                        <FileStack className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
                        <p className="text-sm text-[var(--text-muted)]">Add related documents</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes section */}
                <div className="mb-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--text-muted)]">Notes</h4>
                    <button className="flex items-center gap-1.5 rounded-md bg-transparent px-2.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:cursor-pointer hover:bg-[var(--surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                      <span className="text-base leading-none">+</span>
                      <span>New Note</span>
                    </button>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] opacity-60">No notes yet</div>
                </div>

                {/* Go to Notion */}
                {project.notion_id && (
                  <div className="mt-auto">
                    <a
                      href={`https://www.notion.so/${project.notion_id}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Go to Notion"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-subtle)]"
                    >
                      Go to Notion
                    </a>
                  </div>
                )}
              </div>

              {/* Right: sidebar with metadata */}
              <div className="flex w-full flex-col border-t border-[var(--border-subtle)] p-6 md:w-80 md:border-l md:border-t-0">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="mb-4 ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Status */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">Status</label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FocusStatusSelect status={project.project_status} onStatusChange={handleStatusChange} />
                  </div>
                </div>

                {/* Properties */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold text-[var(--text-muted)]">Properties</label>
                  <div className="space-y-2 rounded-md bg-[var(--surface-muted)] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-muted)]">ID:</span>
                      <span className="truncate font-mono text-xs text-[var(--text)]">{project.project_id}</span>
                    </div>
                    {isEditingProjectKey ? (
                      <div>
                        <EditableSmallInput
                          value={editedProjectKey}
                          onChange={(value) => {
                            const sanitized = value
                              .replace(/[^A-Za-z]/g, "")
                              .toUpperCase()
                              .slice(0, 4);
                            setEditedProjectKey(sanitized);
                          }}
                          onSave={handleSaveProjectKey}
                          onCancel={handleCancelProjectKey}
                          placeholder="PROJ"
                          maxLength={4}
                          label="Project Key:"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Key:</span>
                        <span
                          onClick={() => setIsEditingProjectKey(true)}
                          className="cursor-pointer truncate rounded-md p-1 font-mono text-xs text-[var(--text)] transition-colors hover:bg-[var(--surface-elevated)]"
                        >
                          {project.project_key}
                        </span>
                      </div>
                    )}
                    {isEditingColor ? (
                      <div>
                        <EditableSmallInput
                          value={editedColor}
                          onChange={setEditedColor}
                          onSave={handleSaveColor}
                          onCancel={handleCancelColor}
                          placeholder="#000000"
                          label="Colour:"
                        />
                      </div>
                    ) : project.colour ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">Colour:</span>
                        <div
                          onClick={() => setIsEditingColor(true)}
                          className="flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors hover:bg-[var(--surface-elevated)]"
                        >
                          <div className="h-4 w-4 rounded-sm border border-[var(--border-subtle)]" style={{ backgroundColor: project.colour }} />
                          <span className="font-mono text-xs text-[var(--text-muted)]">{project.colour}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Actions menu */}
                <div className="mt-auto">
                  <VerticalDotsMenu items={menuItems} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Focus"
        description={`Are you sure you want to permanently delete "${project?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteProject}
      />
    </>
  );
}
