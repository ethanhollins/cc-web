"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Edit01, Send01, Trash01, X } from "@untitledui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/application/cards/Card";
import { useCreateJournalNote, useDeleteNote, useNote, useSummarizeNote, useUpdateNote } from "@/hooks/use-notes";

interface JournalProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
}

// Helper function to format date in local timezone as YYYY-MM-DD
const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const Journal = ({ selectedDate, onDateChange }: JournalProps) => {
    const currentDate = selectedDate || new Date();
    const dateString = formatDateLocal(currentDate); // YYYY-MM-DD format in local timezone
    const noteId = `journal-${dateString}`;

    // Hooks for note management
    const { note, loading: noteLoading, error: noteError, refetch } = useNote(noteId);
    const { updateNote, loading: updateLoading } = useUpdateNote();
    const { createJournalNote, loading: createLoading } = useCreateJournalNote();
    const { summarizeNote, loading: summarizeLoading } = useSummarizeNote();
    const { deleteNote, loading: deleteLoading } = useDeleteNote();

    // Component state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [messageQueue, setMessageQueue] = useState<Array<{ id: string; text: string; timestamp: Date }>>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [noteCreationAttempted, setNoteCreationAttempted] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

    const headerTitle = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handlePreviousDay = () => {
        const previousDay = new Date(currentDate);
        previousDay.setDate(previousDay.getDate() - 1);
        onDateChange?.(previousDay);
    };

    const handleNextDay = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        onDateChange?.(nextDay);
    };

    const isToday = currentDate.toDateString() === new Date().toDateString();
    const isFuture = currentDate > new Date();

    // Reset note creation attempt when date changes
    useEffect(() => {
        setNoteCreationAttempted(false);
    }, [dateString]);

    // Create note if it doesn't exist when date changes
    useEffect(() => {
        const createNoteIfNeeded = async () => {
            // Only create if:
            // 1. We've finished loading the note
            // 2. There's no existing note
            // 3. There was an error (likely 404 - note not found)
            // 4. We haven't already attempted to create a note for this date
            // 5. We're not currently creating a note
            if (!noteLoading && !note && noteError && !noteCreationAttempted && !createLoading) {
                setNoteCreationAttempted(true);
                try {
                    const createdNote = await createJournalNote(dateString);
                    if (createdNote) {
                        refetch();
                    }
                } catch (error) {
                    console.error("Failed to create journal note:", error);
                    // Reset the flag so user can try again if needed
                    setNoteCreationAttempted(false);
                }
            }
        };

        createNoteIfNeeded();
    }, [dateString, note, noteLoading, noteError, noteCreationAttempted, createLoading, createJournalNote, refetch]);

    // Edit mode functions
    const handleEditClick = () => {
        setEditContent(note?.content || "");
        setIsEditMode(true);
    };

    const handleSaveEdit = async () => {
        if (!noteId || !editContent.trim()) return;

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
        if (!isEditMode) {
            handleEditClick();
        }
    };

    const handleMaximize = () => {
        setIsMaximized(true);
    };

    const handleCloseModal = () => {
        setIsMaximized(false);
        setIsEditMode(false);
        setShowDeleteConfirm(false);
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
                setIsMaximized(false);
                refetch();
            }
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

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

    // Auto-focus and resize textarea when entering edit mode
    useEffect(() => {
        if (isEditMode && textareaRef.current) {
            textareaRef.current.focus();
            const textarea = textareaRef.current;
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
        }
    }, [isEditMode]);

    // Chat functionality
    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessageQueue((prev) => [...prev, newMessage]);
        setInputValue("");

        // Reset textarea height
        if (chatTextareaRef.current) {
            chatTextareaRef.current.style.height = "auto";
        }

        // Process messages if not currently processing
        if (!isProcessing && noteId) {
            processPendingMessages([...messageQueue, newMessage]);
        }
    };

    const processPendingMessages = async (messages: Array<{ id: string; text: string; timestamp: Date }>) => {
        if (!noteId || messages.length === 0 || isProcessing) return;

        setIsProcessing(true);

        try {
            const messageTexts = messages.map((msg) => msg.text);
            const result = await summarizeNote(noteId, messageTexts);

            if (result) {
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

    // Handle escape key for modal
    useEffect(() => {
        if (!isMaximized) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isEditMode) {
                    handleCancelEdit();
                } else {
                    handleCloseModal();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [isMaximized, isEditMode]);

    return (
        <>
            {/* Card view */}
            <Card className="flex h-full w-full flex-col">
                {/* Header with date navigation */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <button onClick={handlePreviousDay} className="rounded-md p-1 transition-colors hover:bg-gray-100">
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h3
                        className={`flex-1 text-center text-sm font-medium ${
                            isToday ? "mx-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-600" : "text-gray-900"
                        }`}
                    >
                        {headerTitle}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button onClick={handleMaximize} className="rounded-md p-1 transition-colors hover:bg-gray-100" title="Expand journal">
                            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNextDay}
                            className="rounded-md p-1 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isFuture}
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                        {noteLoading || createLoading ? (
                            <div className="space-y-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        ) : note?.content ? (
                            <div className="w-full">
                                <div className="group w-full">
                                    <div
                                        className="markdown-content journal-markdown-content group min-h-[120px] cursor-pointer rounded-lg p-3 transition-colors hover:bg-gray-50"
                                        onClick={handleMaximize}
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
                                                    // Check if this list item contains a checkbox
                                                    const hasTaskList = React.Children.toArray(children).some(
                                                        (child) => React.isValidElement(child) && (child.props as any)?.type === "checkbox",
                                                    );

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
                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                                            </svg>
                                            Click to expand
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* No content - create new */
                            <div
                                className="flex h-full cursor-pointer items-center justify-center rounded-lg p-4 transition-colors hover:bg-gray-50"
                                onClick={handleMaximize}
                            >
                                <div className="text-center text-gray-500">
                                    <p className="text-sm">No journal entry yet.</p>
                                    <p className="mt-1 text-xs">Click to create your first entry!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message queue */}
                    {messageQueue.length > 0 && (
                        <div className="mx-4 mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                            <div className="mb-1 text-xs text-gray-500">{isProcessing ? "Processing..." : `${messageQueue.length} queued`}</div>
                            <div className="space-y-1">
                                {messageQueue.slice(0, 2).map((message) => (
                                    <div key={message.id} className="truncate text-xs text-gray-600">
                                        {message.text}
                                    </div>
                                ))}
                                {messageQueue.length > 2 && <div className="text-xs text-gray-400">+{messageQueue.length - 2} more...</div>}
                            </div>
                        </div>
                    )}

                    {/* Chat input */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <textarea
                                ref={chatTextareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a quick note..."
                                className="max-h-20 min-h-[1.25rem] flex-1 resize-none bg-transparent text-sm placeholder-gray-400 focus:outline-none"
                                rows={1}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "auto";
                                    target.style.height = Math.min(target.scrollHeight, 80) + "px";
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || !noteId}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send01 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Modal view */}
            {isMaximized && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    aria-modal="true"
                    role="dialog"
                    onClick={handleCloseModal}
                >
                    {/* Modal */}
                    <div
                        className="relative z-10 mx-4 flex h-[92vh] w-[920px] max-w-full transform flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Content area */}
                        <div className="relative flex flex-1 flex-col overflow-hidden">
                            {/* Back button */}
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 left-4 z-10 flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Go back to home page"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>

                            {/* Delete button - only show if we have a note */}
                            {note?.content && (
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
                                {noteLoading || createLoading ? (
                                    <div className="space-y-4">
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
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
                                                    className="markdown-content journal-markdown-content group mb-10 max-w-none cursor-pointer rounded-lg p-4 transition-colors hover:bg-gray-50"
                                                    onClick={handleClickToEdit}
                                                    title="Click to edit"
                                                >
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            // Custom checkbox rendering
                                                            input: ({ type, checked, ...props }) => {
                                                                if (type === "checkbox") {
                                                                    return (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            className="accent-blue-600"
                                                                            disabled
                                                                            {...props}
                                                                        />
                                                                    );
                                                                }
                                                                return <input type={type} {...props} />;
                                                            },
                                                            // Style list items properly for task lists
                                                            li: ({ children, className, ...props }) => {
                                                                // Check if this list item contains a checkbox
                                                                const hasTaskList = React.Children.toArray(children).some(
                                                                    (child) => React.isValidElement(child) && (child.props as any)?.type === "checkbox",
                                                                );

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
                                                    <h3 className="text-lg font-medium text-gray-900">Create New Journal Entry</h3>
                                                </div>
                                                <textarea
                                                    ref={textareaRef}
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="min-h-[400px] w-full resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder="Enter your journal entry..."
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
                                                onClick={handleClickToEdit}
                                                title="Click to create journal entry"
                                            >
                                                <div className="text-gray-400">
                                                    <p>No content yet. Click here to create a journal entry.</p>
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
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Journal Entry</h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Are you sure you want to delete this journal entry? This action cannot be undone.
                                    </p>
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
            )}
        </>
    );
};
