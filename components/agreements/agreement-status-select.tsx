"use client";

import * as React from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { updateAgreementStatus } from "@/lib/actions/agreements";

const STATUSES = ["DRAFT", "SENT", "SIGNED", "EXPIRED", "CANCELLED"] as const;

const LABELS: Record<(typeof STATUSES)[number], string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  SIGNED: "Signed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export function AgreementStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  return (
    <Select
      value={value}
      disabled={pending}
      className="h-8 w-[130px] text-xs"
      onChange={async (e) => {
        const next = e.target.value;
        const prev = value;
        setValue(next);
        setPending(true);
        try {
          await updateAgreementStatus(id, next);
        } catch {
          setValue(prev);
          toast.error("Could not update status");
        } finally {
          setPending(false);
        }
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
