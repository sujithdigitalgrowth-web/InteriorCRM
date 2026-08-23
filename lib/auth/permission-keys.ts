export const PERMISSION_KEYS = [
  "dashboard",
  "clients",
  "projects",
  "vendors",
  "vendorQuota",
  "quotations",
  "agreements",
  "finance",
  "revenue",
  "manageTeam",
  "manageSettings",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: "View Dashboard",
  clients: "View Clients",
  projects: "View Projects",
  vendors: "View Vendors",
  vendorQuota: "View Vendor Quota",
  quotations: "View Quotations",
  agreements: "View Agreements",
  finance: "View Finance Page",
  revenue: "View Revenue Numbers (Dashboard, Projects, Clients)",
  manageTeam: "Manage Team & Permissions",
  manageSettings: "Manage Studio Settings",
};
