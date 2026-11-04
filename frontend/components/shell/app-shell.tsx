"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Topbar } from "@/components/topbar/topbar";
import { isMockMode } from "@/lib/api/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#060b18]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} mobileOpen={mobileOpen} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-white/[0.06] py-4">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-slate-500 sm:px-6 lg:px-8">
            <span>CoatLab · Materials Intelligence Platform</span>
            <span>
              {isMockMode
                ? "Mock API mode — connect NEXT_PUBLIC_API_BASE_URL for live backend"
                : "Connected to live backend"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
