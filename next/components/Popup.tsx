"use client";

import { useEffect, type ReactNode } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Popup({
  isOpen,
  onClose,
  children,
  maxWidth = "600px",
}: PopupProps) {
  // Prevent scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blur background overlay */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-md" />

      {/* Content */}
      <div
        className="relative z-50 w-[90%] max-h-[80vh] bg-surface/95 backdrop-blur-sm border border-primary shadow-2xl overflow-auto"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-7 right-7 z-10 bg-primary text-surface hover:opacity-90 text-sm font-medium px-2 py-1 cursor-pointer transition-opacity"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
