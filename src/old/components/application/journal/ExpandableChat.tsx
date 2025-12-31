"use client";

import { useRef, useState } from "react";
import { Image01, Plus, Send01 } from "@untitledui/icons";

interface ChatMessage {
    type: "text" | "image";
    content: string; // text content or base64 image data
    fileName?: string; // for images
}

interface ExpandableChatProps {
    onSendMessage: (message: ChatMessage) => Promise<void>;
    isLoading?: boolean;
}

export const ExpandableChat = ({ onSendMessage, isLoading = false }: ExpandableChatProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        // Clear state when closing
        if (isExpanded) {
            setTextInput("");
            setSelectedImage(null);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file);
        }
    };

    const handleSend = async () => {
        if (!textInput.trim() && !selectedImage) return;

        try {
            if (selectedImage) {
                // Convert image to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result as string;
                    await onSendMessage({
                        type: "image",
                        content: base64String,
                        fileName: selectedImage.name,
                    });
                };
                reader.readAsDataURL(selectedImage);
            } else {
                await onSendMessage({
                    type: "text",
                    content: textInput,
                });
            }

            // Clear inputs after sending
            setTextInput("");
            setSelectedImage(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed right-4 bottom-4 z-50">
            {/* Animated Chat Container */}
            <div
                className={`transition-all duration-300 ease-out ${
                    isExpanded ? "h-auto w-80 rounded-lg" : "h-12 w-12 rounded-full"
                } overflow-hidden border border-gray-200 bg-white shadow-lg`}
            >
                {/* Chat Content - only visible when expanded */}
                {isExpanded && (
                    <div className="duration-200 animate-in fade-in-0">
                        <div className="border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900">Add to Journal</h3>
                                <button onClick={handleToggle} className="text-gray-400 transition-colors hover:text-gray-600">
                                    <Plus className="h-4 w-4 rotate-45" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3 p-4">
                            {/* Image Preview */}
                            {selectedImage && (
                                <div className="relative">
                                    <img src={URL.createObjectURL(selectedImage)} alt="Selected" className="h-32 w-full rounded-lg object-cover" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="bg-opacity-50 absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-sm text-white"
                                    >
                                        ×
                                    </button>
                                    <div className="mt-2 text-xs text-gray-500">{selectedImage.name}</div>
                                </div>
                            )}

                            {/* Text Input */}
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="What's on your mind?"
                                className="h-20 w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                                    disabled={isLoading}
                                >
                                    <Image01 className="h-4 w-4" />
                                    Image
                                </button>

                                <button
                                    onClick={handleSend}
                                    disabled={(!textInput.trim() && !selectedImage) || isLoading}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <Send01 className="h-4 w-4" />
                                    )}
                                    Send
                                </button>
                            </div>

                            {/* Hidden File Input */}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </div>
                    </div>
                )}

                {/* Toggle Button - only visible when collapsed */}
                {!isExpanded && (
                    <button
                        onClick={handleToggle}
                        className="flex h-full w-full items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                )}
            </div>
        </div>
    );
};
