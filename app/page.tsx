"use client";

import { useState, useEffect } from "react";
import type { Filter, HexItem, ThemeMode } from "@/lib/types";
import { THEME_LABELS, initTheme, toggleTheme } from "@/lib/theme";
import { useTooltip } from "@/lib/tooltip";
import Portfolio from "@/components/Portfolio";
import Popup from "@/components/Popup";
import { CV, Email, Github, LinkedIn, WhatsApp } from "@/components/SVG";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HexItem | null>(null);
  const [bioVisible, setBioVisible] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [cvLink, setCvLink] = useState("");
  const [emailLink, setEmailLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const { showTooltip, hideTooltip, updatePosition } = useTooltip();

  useEffect(() => {
    setTheme(initTheme());

    const cvPath =
      "t" +
      "o" +
      "r" +
      "r" +
      "e" +
      "s" +
      "_" +
      "j" +
      "u" +
      "s" +
      "t" +
      "i" +
      "n" +
      "_" +
      "c" +
      "v" +
      "." +
      "p" +
      "d" +
      "f";
    setCvLink(cvPath);

    const protocol = "m" + "a" + "i" + "l" + "t" + "o:";
    const user = "m" + "e";
    const domain =
      "j" +
      "u" +
      "s" +
      "t" +
      "i" +
      "n" +
      "t" +
      "o" +
      "r" +
      "r" +
      "e" +
      "s" +
      "." +
      "c" +
      "o" +
      "m";
    setEmailLink(protocol + user + "@" + domain);

    const waPrefix = "https://" + "wa" + ".me/";
    const waNumber =
      "+" + "3" + "4" + "6" + "0" + "4" + "0" + "0" + "7" + "1" + "7" + "8";
    setWhatsappLink(waPrefix + waNumber);
  }, []);

  function handleThemeToggle(): void {
    setTheme(toggleTheme(theme));
  }

  return (
    <main className="relative h-screen bg-background overflow-hidden">
      <div className="absolute inset-0">
        <Portfolio
          filter={filter}
          theme={theme}
          selectedItem={selectedItem}
          onLoadingChange={setLoading}
          onSelectedChange={setSelectedItem}
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="hex-container w-60 h-64">
              <div className="hex-tile" />
              <div className="hex-inner-inset">
                <img
                  src="me.gif"
                  alt="Loading"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <h4 className="text-lg font-bold text-primary">Loading...</h4>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      {!loading && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-row justify-center">
          <div className="flex flex-row flex-wrap justify-center items-center gap-3 px-4 py-2 bg-surface/60 backdrop-blur-sm border border-border/50 shadow-sm pointer-events-auto">
            <p className="text-xs text-muted select-none">
              justintorres.com CC-BY-4.0
            </p>
            <span className="text-xs text-muted select-none">•</span>
            <p className="text-xs text-primary select-none">drag to orbit</p>
            <span className="text-xs text-muted select-none">•</span>
            <p className="text-xs text-primary select-none">scroll to zoom</p>
            <span className="text-xs text-muted select-none">•</span>
            <p className="text-xs text-primary select-none">
              click for details
            </p>
            <span className="text-xs text-muted select-none">•</span>
            <button
              onClick={handleThemeToggle}
              className="text-xs text-primary hover:text-primary transition-colors cursor-pointer"
              aria-label={`Theme: ${theme}`}
              title={`Theme: ${theme}`}
            >
              theme: {THEME_LABELS[theme]}
            </button>
          </div>
        </div>
      )}

      {/* BIOGRAPHY */}
      <Popup
        isOpen={!loading && bioVisible}
        onClose={() => setBioVisible(false)}
        maxWidth="600px"
      >
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Photo Left */}
          <div className="shrink-0 w-full sm:w-60">
            <img
              src="me.jpg"
              alt="Justin Torres"
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
          {/* Text Right */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col items-start justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                Justin Torres
              </h2>
              <p className="text-sm font-bold tracking-wide uppercase text-muted">
                Internet Enthusiast
              </p>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Hi, I'm Justin! 20 years since my first website and 15 years as
              chief developer for a legal marketing firm. I'm a US citizen and
              telework in Spain, where I spend my free time in nature and
              staying active.
            </p>
          </div>
        </div>
      </Popup>

      {/* BAR */}
      {!loading && (
        <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 bg-surface/80 backdrop-blur-sm border-t border-border shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            {/* Left: Name and Filters */}
            <div className="flex items-center gap-4">
              <h1
                onClick={() => setBioVisible(!bioVisible)}
                className="text-lg sm:text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
                title="Justin Torres - Click to toggle biography"
              >
                <span className="md:hidden">JT</span>
                <span className="hidden md:inline">Justin Torres</span>
              </h1>
              <div className="flex gap-2">
                {(["all", "skills", "works"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-sm font-medium capitalize transition-all cursor-pointer ${
                      filter === f
                        ? "bg-primary text-surface shadow-sm"
                        : "text-muted hover:text-primary hover:bg-surface/50"
                    }`}
                    title={`Show ${f === "all" ? "all items" : f} in portfolio`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Social Links */}
            <ul className="flex gap-3 list-none">
              <li>
                <a
                  href={cvLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity block"
                  aria-label="Resume / CV"
                  onMouseEnter={() => showTooltip("Resume / CV")}
                  onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                >
                  <CV className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/justintorres"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity block"
                  aria-label="GitHub"
                  onMouseEnter={() => showTooltip("GitHub")}
                  onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                >
                  <Github className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/justintorres"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity block"
                  aria-label="LinkedIn"
                  onMouseEnter={() => showTooltip("LinkedIn")}
                  onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                >
                  <LinkedIn className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href={emailLink}
                  className="text-primary hover:opacity-80 transition-opacity block"
                  aria-label="Email"
                  onMouseEnter={() => showTooltip("Email")}
                  onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                >
                  <Email className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 transition-opacity block"
                  aria-label="WhatsApp"
                  onMouseEnter={() => showTooltip("WhatsApp")}
                  onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                  onMouseLeave={hideTooltip}
                >
                  <WhatsApp className="w-6 h-6" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* SELECTED ITEM */}
      <Popup
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="600px"
      >
        {selectedItem && (
          <div className="p-6 space-y-6">
            <h3 className="text-3xl font-semibold text-primary leading-tight">
              {selectedItem.name}
            </h3>
            {selectedItem.description && (
              <p className="text-md text-muted leading-relaxed">
                {selectedItem.description}
              </p>
            )}
            {selectedItem.level !== undefined &&
              (() => {
                const order = ["beginner", "knowledgeable", "expert"] as const;
                const reached = order.indexOf(selectedItem.level!);
                return (
                  <div className="flex items-center gap-1.5">
                    {order.map((tier, i) => (
                      <div key={tier} className="flex-1 flex flex-col gap-1">
                        <div
                          className={`h-1.5 ${i <= reached ? "bg-primary" : "bg-border"}`}
                        />
                        <span className={`text-sm capitalize ${i <= reached ? "text-primary" : "text-muted"}`}>
                          {tier}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            {selectedItem.url && (
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-sm font-medium bg-primary text-surface px-3 py-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>Visit ↗</span>
              </a>
            )}
          </div>
        )}
      </Popup>
    </main>
  );
}
