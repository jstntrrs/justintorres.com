"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Filter, ThemeMode } from "@/lib/types";
import { THEME_LABELS } from "@/lib/constants";
import { initTheme, toggleTheme, buildContactLinks } from "@/lib/client";
import { useNavigation } from "@/lib/hooks";
import { useTooltip } from "@/lib/context";
import Portfolio from "@/components/Portfolio";
import Popup from "@/components/Popup";
import {
  CV,
  Email,
  Github,
  LinkedIn,
  WhatsApp,
  ThemeToggle,
  HelpCircle,
  Menu,
} from "@/components/SVG";

export default function Layout() {
  const { filter, selectedItem, navigate } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [bioVisible, setBioVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("auto");
  const [cvLink, setCvLink] = useState("");
  const [emailLink, setEmailLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const { showTooltip, hideTooltip, updatePosition } = useTooltip();

  useEffect(() => {
    setTheme(initTheme());
    const links = buildContactLinks();
    setCvLink(links.cv);
    setEmailLink(links.email);
    setWhatsappLink(links.whatsapp);
  }, []);

  function handleThemeToggle(): void {
    setTheme(toggleTheme(theme));
  }

  return (
    <main className="relative h-dvh bg-background overflow-hidden">
      <div className="absolute inset-0">
        <Portfolio
          filter={filter}
          theme={theme}
          selectedItem={selectedItem}
          onLoadingChange={setLoading}
          onSelectedChange={navigate}
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
                  src="/me.gif"
                  alt="Loading"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <h4 className="text-lg font-bold text-primary">Loading...</h4>
          </div>
        </div>
      )}

      {/* HELP POPUP */}
      <Popup
        isOpen={helpVisible}
        onClose={() => setHelpVisible(false)}
        maxWidth="400px"
      >
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-primary">How to navigate</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <span className="text-primary font-medium">Drag</span> — orbit the
              grid
            </li>
            <li>
              <span className="text-primary font-medium">Scroll</span> — zoom in
              / out
            </li>
            <li>
              <span className="text-primary font-medium">Click a tile</span> —
              view details
            </li>
            <li>
              <span className="text-primary font-medium">Filter buttons</span> —
              show skills or works
            </li>
          </ul>
          <p className="text-xs text-muted pt-2 border-t border-border">
            justintorres.com — CC-BY-4.0
          </p>
        </div>
      </Popup>

      {/* BIOGRAPHY */}
      <Popup
        isOpen={!loading && bioVisible}
        onClose={() => setBioVisible(false)}
        maxWidth="600px"
      >
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          <div className="shrink-0 w-full sm:w-60">
            <img
              src="/me.jpg"
              alt="Justin Torres"
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
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

      {/* BRAND */}
      {!loading && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto md:top-6 md:left-6 pointer-events-auto">
          <div className="flex flex-row items-center gap-2 px-4 py-3 bg-surface/80 backdrop-blur-sm border-t border-border shadow-lg">
            <button
              onClick={() => setBioVisible(!bioVisible)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Justin Torres — click to toggle biography"
              title="Justin Torres — click to toggle biography"
            >
              <Menu className="w-5 h-5 text-primary shrink-0" />
              <span className="text-lg sm:text-2xl font-bold text-primary">
                <span className="md:hidden">JT</span>
                <span className="hidden md:inline">Justin Torres</span>
              </span>
            </button>
            <div className="flex gap-1">
              {(["all", "skills", "works"] as Filter[]).map((f) => (
                <Link
                  key={f}
                  href={f === "all" ? "/" : `/${f}`}
                  className={`px-3 py-1.5 text-sm font-medium capitalize transition-all cursor-pointer ${
                    filter === f
                      ? "bg-primary text-surface shadow-sm"
                      : "text-muted hover:text-primary hover:bg-surface/50"
                  }`}
                  title={`Show ${f === "all" ? "all items" : f} in portfolio`}
                >
                  {f}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ICONS */}
      {!loading && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto md:bottom-6 md:right-6 pointer-events-auto">
          <div className="flex flex-row items-center gap-2 px-4 py-3 bg-surface/80 backdrop-blur-sm border-t border-border shadow-lg">
            <div className="flex gap-3">
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
              <a
                href="https://github.com/jstntrrs"
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
            </div>
            <div className="w-full md:w-px h-px md:h-6 bg-border" />
            <div className="flex gap-3">
              <button
                onClick={handleThemeToggle}
                className="text-primary hover:opacity-80 transition-opacity cursor-pointer"
                aria-label={`Theme: ${theme} — click to toggle`}
                title={`Theme: ${THEME_LABELS[theme]}`}
                onMouseEnter={() =>
                  showTooltip(`Theme: ${THEME_LABELS[theme]}`)
                }
                onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
              >
                <ThemeToggle className="w-6 h-6" />
              </button>
              <button
                onClick={() => setHelpVisible(true)}
                className="text-primary hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Help"
                title="Help"
                onMouseEnter={() => showTooltip("Help")}
                onMouseMove={(e) => updatePosition(e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELECTED ITEM */}
      <Popup
        isOpen={!!selectedItem}
        onClose={() => navigate(null)}
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
                        <span
                          className={`text-sm capitalize ${i <= reached ? "text-primary" : "text-muted"}`}
                        >
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
