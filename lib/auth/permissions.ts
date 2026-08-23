import "server-only";
import { prisma } from "@/lib/prisma";
import { getSessionMember } from "@/lib/auth/session";
import { PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/permission-keys";
import type { AccessRole, RolePermission } from "@prisma/client";

export { PERMISSION_KEYS, PERMISSION_LABELS, type PermissionKey } from "@/lib/auth/permission-keys";

const DEFAULT_PERMISSIONS: Record<AccessRole, Record<PermissionKey, boolean>> = {
  ADMIN: {
    dashboard: true,
    clients: true,
    projects: true,
    vendors: true,
    vendorQuota: true,
    quotations: true,
    agreements: true,
    finance: true,
    revenue: true,
    manageTeam: true,
    manageSettings: true,
  },
  FINANCE: {
    dashboard: true,
    clients: true,
    projects: true,
    vendors: true,
    vendorQuota: true,
    quotations: true,
    agreements: true,
    finance: true,
    revenue: true,
    manageTeam: false,
    manageSettings: false,
  },
  EMPLOYEE: {
    dashboard: true,
    clients: true,
    projects: true,
    vendors: true,
    vendorQuota: true,
    quotations: true,
    agreements: true,
    finance: false,
    revenue: false,
    manageTeam: false,
    manageSettings: false,
  },
};

export async function ensureRolePermissionsSeeded() {
  const roles: AccessRole[] = ["ADMIN", "FINANCE", "EMPLOYEE"];
  for (const role of roles) {
    const existing = await prisma.rolePermission.findUnique({ where: { role } });
    if (!existing) {
      await prisma.rolePermission.create({ data: { role, ...DEFAULT_PERMISSIONS[role] } });
    }
  }
}

export async function getAllRolePermissions(): Promise<RolePermission[]> {
  await ensureRolePermissionsSeeded();
  return prisma.rolePermission.findMany({ orderBy: { role: "asc" } });
}

export async function getRolePermissions(role: AccessRole): Promise<Record<PermissionKey, boolean>> {
  const record = await prisma.rolePermission.findUnique({ where: { role } });
  if (record) {
    return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, record[key]])) as Record<PermissionKey, boolean>;
  }
  await ensureRolePermissionsSeeded();
  return DEFAULT_PERMISSIONS[role];
}

export async function getCurrentMember() {
  return getSessionMember();
}

export async function can(key: PermissionKey): Promise<boolean> {
  const member = await getCurrentMember();
  if (!member) return false;
  if (member.accessRole === "ADMIN") return true;
  const permissions = await getRolePermissions(member.accessRole);
  return permissions[key];
}
