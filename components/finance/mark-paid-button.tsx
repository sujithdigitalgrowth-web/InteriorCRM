"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markTransactionPaid } from "@/lib/actions/transactions";

export function MarkPaidButton({ id }: { id: string }) {
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-sage hover:bg-sage/10"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await markTransactionPaid(id);
          toast.success("Marked as paid");
        } catch {
          toast.error("Could not update transaction");
        } finally {
          setPending(false);
        }
      }}
    >
      <CheckCircle2 /> {pending ? "Updating…" : "Mark Paid"}
    </Button>
  );
}
