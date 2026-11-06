"use client";

import { Bell, CheckCheck, Loader2, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications/store";
import { cn } from "@/lib/utils";

const kindIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const kindColors = {
  success: "text-emerald-400",
  info: "text-teal-400",
  warning: "text-amber-400",
};

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const Icon = kindIcons[item.kind];
  return (
    <button
      type="button"
      onClick={() => markNotificationRead(item.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-transparent px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
        item.read
          ? "hover:bg-white/[0.03]"
          : "border-white/[0.07] bg-teal-500/[0.06] hover:bg-teal-500/[0.1]",
      )}
    >
      <Icon className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", kindColors[item.kind])} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={cn("text-[13px] font-medium", item.read ? "text-slate-400" : "text-white")}>
            {item.title}
          </span>
          {!item.read && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" aria-label="Unread" />
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{item.message}</span>
        <span className="mt-1 block text-[11px] text-slate-500">
          {formatTimestamp(item.createdAt)}
        </span>
      </span>
    </button>
  );
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const { items, unreadCount } = useNotifications();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Account"
          title="Notifications"
          description="Updates from your CoatLab workspace."
        />
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="You are not signed in"
          description="Sign in to receive and manage workspace notifications."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Account"
        title="Notifications"
        description={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
            : "Updates from your CoatLab workspace."
        }
      />

      <Card pad={false} className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="No notifications yet"
              description="Notifications from your actions, such as completed predictions, will appear here."
              compact
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">
                {items.length} notification{items.length === 1 ? "" : "s"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </Button>
            </div>
            <ul className="divide-y divide-white/[0.05]">
              {items.map((item) => (
                <li key={item.id}>
                  <NotificationRow item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}