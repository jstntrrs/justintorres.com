"use client";

import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(event: React.MouseEvent): void {
    setIsVisible(true);
    updatePosition(event);
  }

  function handleMouseMove(event: React.MouseEvent): void {
    updatePosition(event);
  }

  function handleMouseLeave(): void {
    setIsVisible(false);
  }

  function updatePosition(event: React.MouseEvent): void {
    setPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 text-xs font-medium text-surface bg-primary shadow-sm text-right"
          style={{ right: `calc(100vw - ${position.x}px)`, top: position.y }}
        >
          {content}
        </div>
      )}
    </>
  );
}
