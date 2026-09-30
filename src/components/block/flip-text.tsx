"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface FlipTextProps {
  className?: string;
  children: string;
  duration?: number;
  delay?: number;
  loop?: boolean;
  separator?: string;
  together?: boolean;
}

export function FlipText({
  className,
  children,
  duration = 2.2,
  delay = 0,
  loop = true,
  separator = " ",
  together = false,
}: FlipTextProps) {
  const words = useMemo(() => children.split(separator), [children, separator]);
  const totalChars = children.length;

  const getCharIndex = (wordIndex: number, charIndex: number) => {
    let index = 0;
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length);
    }
    return index + charIndex;
  };

  return (
    <>
      <style>{`
        @keyframes flipTextKeyframes {
          0%, 100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateY(180deg);
            opacity: 0.7;
          }
        }
        .animate-flip-text-char {
          display: inline-block;
          backface-visibility: visible;
          animation: flipTextKeyframes var(--flip-duration, 2.2s) var(--flip-delay, 0s) var(--flip-iteration, infinite) ease-in-out;
        }
      `}</style>
      <span
        className={cn("flip-text-wrapper inline-block leading-normal font-extrabold text-blue-500 dark:text-blue-400", className)}
        style={{ perspective: "1000px" }}
      >
        {words.map((word, wordIndex) => {
          const chars = word.split("");

          return (
            <span key={wordIndex} className="word inline-block whitespace-nowrap">
              {chars.map((char, charIndex) => {
                const currentGlobalIndex = getCharIndex(wordIndex, charIndex);
                let calculatedDelay = delay;
                if (!together) {
                  const normalizedIndex = currentGlobalIndex / totalChars;
                  const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
                  calculatedDelay = sineValue * (duration * 0.25) + delay;
                }

                return (
                  <span
                    key={charIndex}
                    className="animate-flip-text-char"
                    style={{
                      "--flip-duration": `${duration}s`,
                      "--flip-delay": `${calculatedDelay}s`,
                      "--flip-iteration": loop ? "infinite" : "1",
                    } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
              {separator === " " && wordIndex < words.length - 1 && (
                <span className="whitespace inline-block">&nbsp;</span>
              )}
            </span>
          );
        })}
      </span>
    </>
  );
}

export default FlipText;
