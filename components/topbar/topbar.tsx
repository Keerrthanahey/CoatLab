"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { allNavItems, getNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Menu, Search, Bell, ChevronDown, CornerDownLeft } from "lucide-react";

export function Topbar({
  onOpenMobile,
}: {
  onOpenMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const current = getNavItem(pathname);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allNavItems.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        go(allNavItems[0].href);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[activeIdx].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const blur = Math.min(24, 8 + scrollY * 0.12);
  const bgOpacity = Math.min(0.85, 0.3 + scrollY * 0.003);
  const borderOpacity = Math.min(0.12, 0.04 + scrollY * 0.0005);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 transition-all duration-200 sm:px-6"
      style={{
        background: `rgba(6,11,24,${bgOpacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        borderBottom: `1px solid rgba(255,255,255,${borderOpacity})`,
      }}
    >
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <div className="min-w-0">
        <p className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-500 sm:block">
          MaterialsAI / <span className="text-teal-400">{current?.label ?? "Dashboard"}</span>
        </p>
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-100">
          {current?.label ?? "Dashboard"}
        </h1>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div ref={searchRef} className="relative hidden w-full max-w-xs md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search pages…"
          className="h-9.5 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
        />
        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-lg border border-white/10 bg-[#0d1830] shadow-2xl shadow-black/40">
            {results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-500">No matching pages</p>
            ) : (
              <ul>
                {results.map((item, i) => (
                  <li key={item.href}>
                    <button
                      onClick={() => go(item.href)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left",
                        i === activeIdx ? "bg-teal-500/10" : "hover:bg-white/[0.04]",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="flex-1">
                        <span className="block text-[13px] font-medium text-slate-100">
                          {item.label}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {item.description}
                        </span>
                      </span>
                      <CornerDownLeft className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          className="flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-teal-400 ring-2 ring-[#060b18]" />
        </button>
      </div>

      {/* User menu */}
      <button className="group flex items-center gap-2.5 rounded-lg border border-transparent py-1 pl-1 pr-2 hover:border-white/10 hover:bg-white/[0.04]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-xs font-semibold text-white">
          AR
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[13px] font-medium text-slate-100">
            A. Researcher
          </span>
          <span className="block text-[11px] text-slate-500">Research lead</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-500 group-hover:text-slate-300 sm:block" />
      </button>
    </header>
  );
}
