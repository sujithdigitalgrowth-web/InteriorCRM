"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/lib/actions/auth";
import type { TeamMember } from "@prisma/client";

const ACCESS_ROLE_LABEL: Record<TeamMember["accessRole"], string> = {
  ADMIN: "Administrator",
  FINANCE: "Finance",
  EMPLOYEE: "Employee",
};

export function AccountMenu({ member }: { member: TeamMember }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80">
          <Avatar name={member.name} />
          <ChevronDown className="size-3.5 text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2.5 py-1.5">
          <p className="text-sm font-medium text-foreground">{member.name}</p>
          <p className="text-xs text-muted">{ACCESS_ROLE_LABEL[member.accessRole]}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onSelect={handleLogout}>
          <LogOut className="size-4" />
          {isPending ? "Signing out…" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
