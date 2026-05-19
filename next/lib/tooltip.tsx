"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface TooltipContextType {
  content: string | null;
  position: { x: number; y: number };
  showTooltip: (content: string) => void;
  hideTooltip: () => void;
  updatePosition: (x: number, y: number) => void;
}

export const TooltipContext = createContext<TooltipContextType | null>(null);

export function useTooltip() {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("useTooltip must be used within TooltipProvider");
  }

  return context;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showTooltip = useCallback((content: string) => {
    setContent(content);
  }, []);

  const hideTooltip = useCallback(() => {
    setContent(null);
  }, []);

  const updatePosition = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  return (
    <TooltipContext.Provider
      value={{ content, position, showTooltip, hideTooltip, updatePosition }}
    >
      {children}
      {content && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 text-xs font-medium text-surface bg-primary shadow-sm -translate-x-1/2"
          style={{ left: position.x, top: position.y + 30 }}
        >
          {content}
        </div>
      )}
    </TooltipContext.Provider>
  );
}
