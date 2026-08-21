"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { PanelLeftClose, PanelLeft, FlaskConical, X } from "lucide-react";
import { useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavLinkContent({ icon: Icon, label, active }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-teal-400" : "text-slate-500",
        )}
      />
      <span
        className={cn(
          "whitespace-nowrap text-[13px] font-medium transition-colors",
          active ? "text-teal-300" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!drawerRef.current) return [];
    return Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseMobile();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, onCloseMobile, getFocusableElements]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const nav = (
    <nav className="flex h-full flex-col bg-[#060b18]">
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/[0.06] px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Link href="/" className={cn("flex items-center gap-3", collapsed && "gap-0")}>
          <Logo className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight text-slate-100">
                CoatLab
              </span>
              <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-widest text-teal-400">
                Materials AI
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "mx-3 mt-3 hidden h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:outline-none lg:flex",
          collapsed ? "w-8" : "w-full gap-2",
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="h-4 w-4" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4" />
            <span className="text-xs font-medium">Collapse</span>
          </>
        )}
      </button>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "border border-teal-500/20 bg-teal-500/10 text-teal-300"
                          : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-teal-500" />
                      )}
                      <NavLinkContent icon={item.icon} label={item.label} active={active} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer status */}
      <div
        className={cn(
          "shrink-0 border-t border-white/[0.06] p-3",
          collapsed && "px-2",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5",
            collapsed && "justify-center px-2",
          )}
        >
          <FlaskConical className="h-4 w-4 shrink-0 text-amber-400" />
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="text-[11px] font-medium leading-tight text-amber-300">
                Mock mode
              </span>
              <span className="truncate text-[10px] leading-tight text-amber-400/70">
                API backend not connected
              </span>
            </span>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 border-r border-white/[0.06] bg-[#060b18] transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-[264px]",
        )}
      >
        {nav}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              key="mobile-drawer-panel"
              ref={drawerRef}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#060b18] shadow-2xl shadow-black/50 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <button
                ref={closeButtonRef}
                onClick={onCloseMobile}
                className="absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:outline-none"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
