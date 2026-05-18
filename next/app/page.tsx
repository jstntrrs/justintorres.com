"use client";

import { useState } from "react";
import { type FilterType, type HexItem } from "@/lib/schema";
import Portfolio from "@/components/Portfolio";

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<HexItem | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<HexItem | null>(null);
  const [bioExpanded, setBioExpanded] = useState(true);

  return (
    <main className="relative h-screen bg-surface overflow-hidden">
      {/* Portfolio Layer - Main Canvas */}
      <div className="absolute inset-0">
        <Portfolio
          filter={filter}
          onFilterChange={setFilter}
          onLoadingChange={setLoading}
          onHoverChange={setHoveredItem}
          onTipPosChange={setTipPos}
          onSelectedChange={setSelectedItem}
        />
      </div>

      {/* BIO */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 max-w-[280px] sm:max-w-xs bg-surface/80 backdrop-blur-sm border border-border shadow-lg pointer-events-auto">
        <div className="p-4 space-y-3">
          <button
            onClick={() => setBioExpanded(!bioExpanded)}
            className="w-full flex items-center  gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl sm:text-4xl font-bold text-primary leading-tight text-left">
              Justin Torres
            </h1>
            <span
              className="text-primary text-3xl shrink-0 transition-transform"
              style={{
                transform: bioExpanded ? "rotate(90deg)" : "rotate(-90deg)",
              }}
            >
              ›
            </span>
          </button>
          {bioExpanded && (
            <>
              <p className="text-sm font-bold tracking-wide uppercase text-muted mt-1">
                Internet Enthusiast
              </p>
              <p className="text-md text-muted leading-relaxed">
                Hi, I'm Justin! 20 years since my first website and 15 years as
                chief developer for a legal marketing firm. I'm a US citizen and
                telework in Spain, where I spend my free time in nature and
                staying active.
              </p>
              <ul className="flex gap-3 list-none text-xs text-primary font-medium">
                <li className="cursor-pointer hover:underline">CV</li>
                <li className="cursor-pointer hover:underline">GH</li>
                <li className="cursor-pointer hover:underline">LI</li>
                <li className="cursor-pointer hover:underline">EM</li>
                <li className="cursor-pointer hover:underline">WA</li>
              </ul>
              <p className="text-xs text-muted">justintorres.com CC-BY-4.0</p>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="absolute top-4 right-4 md:top-10 md:right-6 flex flex-col sm:flex-row gap-2 bg-surface/80 backdrop-blur-sm border border-border shadow-lg pointer-events-auto">
        <div className="flex gap-2 p-2">
          {(["all", "skills", "works"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 text-md font-medium capitalize transition-all cursor-pointer
                ${
                  filter === f
                    ? "bg-primary text-surface shadow-sm"
                    : "text-muted hover:text-primary hover:bg-surface/50"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* INSTRUCTIONS */}
      {!loading && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface/60 backdrop-blur-sm border border-border/50 shadow-sm pointer-events-none">
          <p className="text-sm text-muted select-none">
            drag to orbit · scroll to zoom
          </p>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="hex-inner w-60 h-64">
            <img
              src="me.gif"
              alt="Loading"
              className="block w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* TOOLTIP */}
      {hoveredItem && !selectedItem && (
        <div
          className="absolute z-10 pointer-events-none px-2 py-1 text-xs font-medium text-surface bg-primary shadow-sm"
          style={{ left: tipPos.x + 14, top: tipPos.y - 28 }}
        >
          {hoveredItem.name}
        </div>
      )}

      {/* SELECTED ITEM */}
      {selectedItem && (
        <div
          className="absolute z-20 bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-80 md:w-96 bg-surface/95 backdrop-blur-sm border border-primary shadow-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-primary leading-tight flex-1">
                {selectedItem.name}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="shrink-0 text-muted hover:text-primary text-sm leading-none cursor-pointer transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {selectedItem.description && (
              <p className="text-xs text-muted leading-relaxed">
                {selectedItem.description}
              </p>
            )}
            {selectedItem.url && (
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-surface px-3 py-1.5 hover:opacity-90 transition-opacity"
              >
                Visit ↗
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
