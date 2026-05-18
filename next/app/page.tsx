"use client";

import { useState } from "react";
import { type Panel } from "@/lib/schema";
import Biography from "@/components/Biography";
import Portfolio from "@/components/Portfolio";

export default function Home() {
  const [active, setActive] = useState<Panel>("bio");

  return (
    <main className="flex flex-col md:flex-row h-screen bg-surface md:divide-x divide-border shadow-sm">
      <div className="flex md:hidden border-b border-border shrink-0">
        <button
          onClick={() => setActive("bio")}
          className={`flex-1 py-3 text-sm font-medium cursor-pointer ${active === "bio" ? "border-b-2 border-primary text-primary" : "text-muted"}`}
        >
          Bio
        </button>
        <button
          onClick={() => setActive("portfolio")}
          className={`flex-1 py-3 text-sm font-medium cursor-pointer ${active === "portfolio" ? "border-b-2 border-primary text-primary" : "text-muted"}`}
        >
          Portfolio
        </button>
      </div>
      <div
        className={`flex-col md:w-auto md:max-w-[420px] md:shrink-0 overflow-y-auto ${active === "bio" ? "flex" : "hidden"} md:flex`}
      >
        <Biography />
      </div>
      <div
        className={`flex-col flex-1 overflow-y-auto ${active === "portfolio" ? "flex" : "hidden"} md:flex`}
      >
        <Portfolio />
      </div>
    </main>
  );
}
