"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Truck,
  Wallet,
  Ruler,
  FileSignature,
  UsersRound,
  Compass,
  Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Settings, TeamMember } from "@prisma/client";
import type { PermissionKey } from "@/lib/auth/permission-keys";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; permission: PermissionKey }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/clients", label: "Clients", icon: Users, permission: "clients" },
  { href: "/projects", label: "Projects", icon: FolderKanban, permission: "projects" },
  { href: "/vendors", label: "Vendors", icon: Truck, permission: "vendors" },
  { href: "/quotations", label: "Quotations", icon: Ruler, permission: "quotations" },
  { href: "/finance", label: "Finance", icon: Wallet, permission: "finance" },
  { href: "/agreements", label: "Agreements", icon: FileSignature, permission: "agreements" },
  { href: "/team", label: "Team", icon: UsersRound, permission: "manageTeam" },
];

const ACCESS_ROLE_LABEL: Record<TeamMember["accessRole"], string> = {
  ADMIN: "Administrator",
  FINANCE: "Finance",
  EMPLOYEE: "Employee",
};

export function Sidebar({
  settings,
  member,
  permissions,
}: {
  settings: Settings;
  member: TeamMember;
  permissions: Record<PermissionKey, boolean>;
}) {
  const pathname = usePathname();
  const nav = NAV.filter((item) => permissions[item.permission]);

  const brandContent = (
    <>
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.logoUrl}
          alt={settings.businessName}
          className="size-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <Compass className="size-5" />
        </div>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate font-display text-base font-medium tracking-tight">{settings.businessName}</p>
        {settings.tagline && (
          <p className="truncate text-[10px] tracking-widest text-sidebar-muted uppercase">{settings.tagline}</p>
        )}
      </div>
    </>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-sidebar text-sidebar-foreground md:flex print:hidden">
      {permissions.manageSettings ? (
        <Link href="/settings" className="flex items-center gap-2.5 px-5 py-5 transition-colors hover:opacity-80">
          {brandContent}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5 px-5 py-5">{brandContent}</div>
      )}

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-l-2 px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-white"
                  : "border-transparent text-sidebar-muted hover:border-white/20 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {settings.quote && (
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-sidebar-active to-sidebar p-4">
            <p className="text-xs italic leading-relaxed text-sidebar-foreground/90">
              &ldquo;{settings.quote}&rdquo;
            </p>
            {settings.quoteAuthor && <p className="mt-2 text-[11px] text-sidebar-muted">— {settings.quoteAuthor}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-3">
        <Avatar name={member.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">{member.name}</p>
          <p className="text-[10px] text-sidebar-muted">{ACCESS_ROLE_LABEL[member.accessRole]}</p>
        </div>
        {permissions.manageSettings && (
          <Link href="/settings" aria-label="Settings">
            <SettingsIcon className="size-3.5 shrink-0 text-sidebar-muted hover:text-white" />
          </Link>
        )}
        <ChevronDown className="size-3.5 shrink-0 text-sidebar-muted" />
      </div>

      <div className="border-t border-white/10 px-4 py-2 text-center">
        <p className="text-[10px] tracking-wide text-sidebar-muted">
          Powered by <span className="font-semibold text-sidebar-foreground/80">XP</span>
        </p>
      </div>
    </aside>
  );
}
