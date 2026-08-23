"use client";

import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";

export function NotificationBell({ items }: { items: { id: string; text: string; subtext: string }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          {items.length > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
              {items.length > 9 ? "9+" : items.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted">
          Needs Attention
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-xs text-muted">You&apos;re all caught up.</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="rounded-sm px-2.5 py-2 hover:bg-surface-muted">
                <p className="text-sm font-medium text-foreground">{n.text}</p>
                <p className="text-xs text-muted">{n.subtext}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
