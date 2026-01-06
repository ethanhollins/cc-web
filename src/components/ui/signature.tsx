"use client";

import { useState } from "react";

interface AnimatedSignatureProps {
  onSign?: () => void;
  userName?: string;
}

export function AnimatedSignature({ onSign, userName = "Ethan Hollins" }: AnimatedSignatureProps) {
  const [isSigned, setIsSigned] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    onSign?.();
  };
  const [rotation] = useState(() => Math.random() * 3 - 3); // Random between -3 and 0 degrees
  const [translateX] = useState(() => Math.random() * 20); // Random between 0 and 20 px
  const [translateY] = useState(() => Math.random() * 5 - 5); // Random between -5 and 0 px

  return (
    <div className="relative border-t border-dashed border-[var(--border-subtle)] pt-4">
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap");

        .signature-container {
          transform: translate(${translateX}px, ${translateY}px) rotate(${rotation}deg);
          display: inline-block;
        }

        .signature-text {
          font-family: "Alex Brush", cursive;
          font-size: 2rem;
          line-height: 1;
          color: var(--accent);
          display: inline-block;
          position: relative;
        }

        .signature-text::after {
          content: "";
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: var(--surface);
          animation: signature-reveal 1.2s ease-in-out forwards;
        }

        @keyframes signature-reveal {
          from {
            clip-path: inset(0 0 0 0);
          }
          to {
            clip-path: inset(0 0 0 100%);
          }
        }

        .signature-line {
          border-bottom: 2px solid var(--border-subtle);
          transition: all 0.2s ease;
        }

        .signature-line:hover {
          border-bottom-color: var(--accent-soft);
          background-color: var(--surface-elevated);
        }

        .signature-line:active {
          transform: translateY(1px);
        }
      `}</style>

      <div className="mb-2 mt-4 text-center text-sm text-[var(--text-muted)] sm:text-center">
        <p className="italic">By signing, you agree to give this your best shot. (Not legally binding, but emotionally binding!)</p>
      </div>

      <div className="flex items-end justify-end gap-3">
        <div className="signature-line relative flex min-h-[3rem] w-full items-end pb-2 sm:min-w-[10rem] sm:max-w-[14rem]">
          {!isSigned ? (
            <button type="button" onClick={handleSign} className="group absolute inset-0 cursor-pointer" aria-label="Click to sign">
              <span className="absolute bottom-2 left-0 text-xs text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                Click to sign
              </span>
            </button>
          ) : (
            <div className="signature-container">
              <div className="signature-text">{userName}</div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 pb-2 text-sm font-medium text-[var(--text-muted)]">
          <span className="text-xl">←</span>
          <span>Sign Here</span>
        </div>
      </div>
    </div>
  );
}
