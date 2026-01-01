"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypewriterTextProps {
  content: string;
  speed?: number; // characters per second
  onComplete?: () => void;
}

export const TypewriterText = ({ content, speed = 50, onComplete }: TypewriterTextProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 1000 / speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [content, currentIndex, speed, onComplete, isComplete]);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [content]);

  return (
    <div className="max-w-none text-xs leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-2 text-sm font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-1 text-xs font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 text-xs font-medium">{children}</h3>,
          p: ({ children }) => <p className="mb-2 text-xs">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-4 text-xs">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 text-xs">{children}</ol>,
          li: ({ children }) => <li className="mb-1 text-xs">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
};
