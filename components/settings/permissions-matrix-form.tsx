"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateRolePermissions } from "@/lib/actions/permissions";
import { PERMISSION_KEYS, PERMISSION_LABELS, type PermissionKey } from "@/lib/auth/permission-keys";

type PermState = Record<PermissionKey, boolean>;

export function PermissionsMatrixForm({
  finance,
  employee,
}: {
  finance: PermState;
  employee: PermState;
}) {
  const [financeState, setFinanceState] = useState(finance);
  const [employeeState, setEmployeeState] = useState(employee);
  const [isPending, startTransition] = useTransition();
  const [savingRole, setSavingRole] = useState<"FINANCE" | "EMPLOYEE" | null>(null);

  function toggle(role: "FINANCE" | "EMPLOYEE", key: PermissionKey) {
    if (role === "FINANCE") {
      setFinanceState((prev) => ({ ...prev, [key]: !prev[key] }));
    } else {
      setEmployeeState((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  }

  function save(role: "FINANCE" | "EMPLOYEE") {
    const state = role === "FINANCE" ? financeState : employeeState;
    setSavingRole(role);
    startTransition(async () => {
      const fd = new FormData();
      for (const key of PERMISSION_KEYS) {
        if (state[key]) fd.set(key, "on");
      }
      await updateRolePermissions(role, fd);
      toast.success(`${role === "FINANCE" ? "Finance" : "Employee"} permissions saved`);
      setSavingRole(null);
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 text-left font-medium text-muted">Permission</th>
            <th className="w-24 py-2 text-center font-medium text-muted">Admin</th>
            <th className="w-24 py-2 text-center font-medium text-muted">Finance</th>
            <th className="w-24 py-2 text-center font-medium text-muted">Employee</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_KEYS.map((key) => (
            <tr key={key} className="border-b border-border/60">
              <td className="py-2.5 pr-4 text-foreground">{PERMISSION_LABELS[key]}</td>
              <td className="py-2.5 text-center">
                <Check className="mx-auto size-4 text-sage" />
              </td>
              <td className="py-2.5 text-center">
                <Checkbox checked={financeState[key]} onChange={() => toggle("FINANCE", key)} />
              </td>
              <td className="py-2.5 text-center">
                <Checkbox checked={employeeState[key]} onChange={() => toggle("EMPLOYEE", key)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-surface-muted/60 px-3 py-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Lock className="size-3.5" /> Admin access is fixed and cannot be restricted.
        </span>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending && savingRole === "FINANCE"}
          onClick={() => save("FINANCE")}
        >
          {isPending && savingRole === "FINANCE" ? "Saving…" : "Save Finance"}
        </Button>
        <Button
          type="button"
          disabled={isPending && savingRole === "EMPLOYEE"}
          onClick={() => save("EMPLOYEE")}
        >
          {isPending && savingRole === "EMPLOYEE" ? "Saving…" : "Save Employee"}
        </Button>
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(
        "size-4 cursor-pointer rounded border-border-strong text-primary accent-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      )}
    />
  );
}
