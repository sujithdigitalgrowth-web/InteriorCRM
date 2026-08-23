"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleClientPriority } from "@/lib/actions/clients";

export function StarToggleButton({ clientId, isPriority }: { clientId: string; isPriority: boolean }) {
  const [pending, setPending] = React.useState(false);
  const [value, setValue] = React.useState(isPriority);

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={value ? "Remove priority" : "Mark as priority client"}
      className="disabled:opacity-50"
      onClick={async () => {
        const next = !value;
        setPending(true);
        setValue(next);
        try {
          await toggleClientPriority(clientId, value);
        } catch {
          setValue(!next);
          toast.error("Could not update");
        } finally {
          setPending(false);
        }
      }}
    >
      <Star className={cn("size-4.5 transition-colors", value ? "fill-ochre text-ochre" : "text-muted hover:text-ochre")} />
    </button>
  );
}
