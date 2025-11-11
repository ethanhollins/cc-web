"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Send01, Trash01, X } from "@untitledui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDeleteNote, useNote, useSummarizeNote, useUpdateNote } from "@/hooks/use-notes";

type Props = {
    open: boolean;
    ticketId: string | null;
    noteId: string | null;
    onClose: () => void;
    onBack: () => void;
};

type QueuedMessage = {
    id: string;
    text: string;
    timestamp: Date;
};

export default function NotesModal({ open, ticketId, noteId, onClose, onBack }: Props) {
    // Fetch note content
    const { note, loading: noteLoading, error: noteError, refetch } = useNote(open ? noteId : null);
    const { summarizeNote, loading: summarizeLoading } = useSummarizeNote();
    const { updateNote, loading: updateLoading } = useUpdateNote();
    const { deleteNote, loading: deleteLoading } = useDeleteNote();

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editContent, setEditContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Chat state
    const [inputValue, setInputValue] = useState("");
    const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Utility function to format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Unknown date";
        }
    };

    // Edit mode functions
    const handleEditClick = () => {
        setEditContent(note?.content || "");
        setIsEditMode(true);
    };

    const handleSaveEdit = async () => {
        if (!noteId) return;

        try {
            const success = await updateNote(noteId, editContent);
            if (success) {
                setIsEditMode(false);
                refetch();
            }
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditContent("");
    };

    const handleClickToEdit = () => {
        if (!isEditMode && note?.content) {
            handleEditClick();
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!noteId) return;

        try {
            const success = await deleteNote(noteId);
            if (success) {
                setShowDeleteConfirm(false);
                onBack(); // Go back to the ticket view after deletion
            }
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    // Handle click outside textarea to save (optional enhancement)
    const handleTextareaBlur = () => {
        // Auto-save when clicking outside the textarea (debounced)
        if (editContent.trim() && editContent !== note?.content) {
            // You might want to add a debounced save here for better UX
        }
    };

    // Auto-focus and resize textarea when entering edit mode
    useEffect(() => {
        if (isEditMode && textareaRef.current) {
            textareaRef.current.focus();
            // Auto-resize textarea to fit content
            const textarea = textareaRef.current;
            textarea.style.height = "auto";
            textarea.style.height = Math.max(textarea.scrollHeight, 200) + "px";
        }
    }, [isEditMode]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: QueuedMessage = {
            id: Date.now().toString(),
            text: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessageQueue((prev) => [...prev, newMessage]);
        setInputValue("");

        // Reset textarea height to original size
        if (chatTextareaRef.current) {
            chatTextareaRef.current.style.height = "auto";
            chatTextareaRef.current.style.height = "1.25rem"; // Reset to min-height
        }

        // If not currently processing and we have a note, process immediately
        if (!isProcessing && noteId) {
            processPendingMessages([...messageQueue, newMessage]);
        }
    };

    const processPendingMessages = async (messages: QueuedMessage[]) => {
        if (!noteId || messages.length === 0 || isProcessing) return;

        setIsProcessing(true);

        try {
            const messageTexts = messages.map((msg) => msg.text);
            const result = await summarizeNote(noteId, messageTexts);

            if (result) {
                // Only remove the messages that were actually processed
                // Keep any new messages that were added during processing
                setMessageQueue((currentQueue) => {
                    const processedMessageIds = new Set(messages.map((msg) => msg.id));
                    return currentQueue.filter((msg) => !processedMessageIds.has(msg.id));
                });
                refetch();
            }
        } catch (error) {
            console.error("Failed to process messages:", error);
        } finally {
            setIsProcessing(false);

            // Process any remaining messages that weren't part of this batch
            setTimeout(() => {
                setMessageQueue((currentQueue) => {
                    if (currentQueue.length > 0) {
                        processPendingMessages(currentQueue);
                    }
                    return currentQueue;
                });
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isEditMode) {
                    handleCancelEdit();
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose, isEditMode]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            {/* Modal */}
            <div
                className="relative z-10 mx-4 flex h-[92vh] w-[920px] max-w-full transform flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Content area */}
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    {/* Back button */}
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 z-10 flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Go back to ticket"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    {/* Delete button - only show if we have a note */}
                    {note && (
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleteLoading}
                            className="absolute top-4 right-4 z-10 flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Delete note"
                        >
                            <Trash01 className="h-5 w-5" />
                        </button>
                    )}

                    {/* Note content */}
                    <div className="flex-1 overflow-auto p-16 pt-16 pb-20">
                        {noteLoading ? (
                            <div className="space-y-4">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        ) : noteError ? (
                            <div className="text-center text-red-600">
                                <p>Error loading note: {noteError}</p>
                            </div>
                        ) : note?.content ? (
                            <div className="w-full">
                                {isEditMode ? (
                                    /* Edit mode - textarea */
                                    <div className="w-full">
                                        <textarea
                                            ref={textareaRef}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onBlur={handleTextareaBlur}
                                            className="max-h-[550px] min-h-[400px] w-full resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Enter your markdown content here..."
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = "auto";
                                                target.style.height = Math.max(target.scrollHeight, 200) + "px";
                                            }}
                                        />
                                        <div className="mt-1 flex items-center justify-between">
                                            <div className="text-xs text-gray-500">Tip: Use Markdown syntax. Press Save to preview your changes.</div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={updateLoading}
                                                    className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    {updateLoading ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Preview mode - clickable markdown */
                                    <div className="w-full">
                                        {/* Created timestamp */}
                                        {note?.created_at && (
                                            <div className="mb-4 border-b border-gray-100 pb-2 text-xs text-gray-500">
                                                Created: {formatTimestamp(note.created_at)}
                                            </div>
                                        )}

                                        <div
                                            className="markdown-content group mb-10 max-w-none cursor-pointer rounded-lg p-4 transition-colors hover:bg-gray-50"
                                            onClick={handleClickToEdit}
                                            title="Click to edit"
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Custom checkbox rendering
                                                    input: ({ type, checked, ...props }) => {
                                                        if (type === "checkbox") {
                                                            return <input type="checkbox" checked={checked} className="accent-blue-600" disabled {...props} />;
                                                        }
                                                        return <input type={type} {...props} />;
                                                    },
                                                    // Style list items properly for task lists
                                                    li: ({ children, className, ...props }) => {
                                                        // Check if this list item contains a checkbox input
                                                        const childArray = React.Children.toArray(children);
                                                        const hasTaskList = childArray.some((child) => {
                                                            if (React.isValidElement(child)) {
                                                                return child.type === "input" && (child.props as any)?.type === "checkbox";
                                                            }
                                                            return false;
                                                        });

                                                        return (
                                                            <li
                                                                className={`${className || ""} ${hasTaskList ? "task-list-item" : "standard-list-item"}`}
                                                                {...props}
                                                            >
                                                                {children}
                                                            </li>
                                                        );
                                                    },
                                                }}
                                            >
                                                {note.content}
                                            </ReactMarkdown>
                                            <div className="mt-4 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                                                Click anywhere to edit this content
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                {isEditMode ? (
                                    /* Edit mode for new content */
                                    <div className="w-full max-w-4xl">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Create New Note</h3>
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onBlur={handleTextareaBlur}
                                            className="min-h-[400px] w-full resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder="Enter your markdown content here..."
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = "auto";
                                                target.style.height = Math.max(target.scrollHeight, 200) + "px";
                                            }}
                                        />
                                        <div className="mt-2 text-xs text-gray-500">Tip: Use Markdown syntax. Press Save to preview your changes.</div>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={updateLoading || !editContent.trim()}
                                                className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Check className="h-4 w-4" />
                                                {updateLoading ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="cursor-pointer rounded-lg p-8 text-center transition-colors hover:bg-gray-50"
                                        onClick={handleEditClick}
                                        title="Click to create note"
                                    >
                                        <div className="text-gray-400">
                                            <p>No content yet. Click here to create a note.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message queue - floating above chat */}
                    {messageQueue.length > 0 && (
                        <div className="absolute right-6 bottom-25 left-6 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                            <div className="mb-2 text-xs text-gray-500">{isProcessing ? "Processing messages..." : "Queued messages:"}</div>
                            <div className="max-h-32 space-y-2 overflow-y-auto">
                                {messageQueue.map((message) => (
                                    <div key={message.id} className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5">
                                        <span className="flex-1 text-sm text-blue-900">
                                            {message.text.length > 60 ? `${message.text.slice(0, 60)}...` : message.text}
                                        </span>
                                        {isProcessing && (
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Floating chat input */}
                    <div className="absolute bottom-8 left-1/2 w-[75%] -translate-x-1/2">
                        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-lg">
                            <textarea
                                ref={chatTextareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={!noteId ? "Select or create a note to start..." : "Add a quick note..."}
                                className="max-h-32 min-h-[1.25rem] flex-1 resize-none overflow-y-auto bg-transparent pl-2 text-sm placeholder-gray-400 focus:outline-none"
                                disabled={!noteId}
                                rows={1}
                                style={{
                                    height: "auto",
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = Math.min(target.scrollHeight, 128) + "px";
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || !noteId}
                                className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send01 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Note</h3>
                            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this note? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deleteLoading}
                                className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
