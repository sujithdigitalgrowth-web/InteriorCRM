import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { can, getAllRolePermissions, PERMISSION_KEYS } from "@/lib/auth/permissions";
import { PermissionsMatrixForm } from "@/components/settings/permissions-matrix-form";

export default async function PermissionsPage() {
  if (!(await can("manageSettings"))) {
    redirect("/settings");
  }

  const roles = await getAllRolePermissions();
  const financeRole = roles.find((r) => r.role === "FINANCE")!;
  const employeeRole = roles.find((r) => r.role === "EMPLOYEE")!;

  const toRecord = (role: (typeof roles)[number]) =>
    Object.fromEntries(PERMISSION_KEYS.map((key) => [key, role[key]])) as Record<
      (typeof PERMISSION_KEYS)[number],
      boolean
    >;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Access & Permissions"
        description="Control what Finance and Employee team members can see across the CRM."
      />
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Admin always has full access. Toggle what Finance and Employee roles can view or manage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsMatrixForm finance={toRecord(financeRole)} employee={toRecord(employeeRole)} />
        </CardContent>
      </Card>
    </div>
  );
}
