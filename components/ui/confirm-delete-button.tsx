"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDeleteButton({
  action,
  label = "Delete",
  confirmMessage = "This action cannot be undone. Continue?",
  className,
}: {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const [pending, setPending] = React.useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("text-danger hover:bg-danger/10", className)}
      disabled={pending}
      onClick={async () => {
        if (!window.confirm(confirmMessage)) return;
        setPending(true);
        try {
          await action();
        } catch {
          toast.error("Could not delete. It may be linked to other records.");
          setPending(false);
        }
      }}
    >
      <Trash2 /> {pending ? "Deleting…" : label}
    </Button>
  );
}
