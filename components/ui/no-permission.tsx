import { Lock } from "lucide-react";

export function NoPermission({
  title = "You do not have permission to view this page",
  description = "Ask an admin to grant you access if you think this is a mistake.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface-muted/40 px-6 py-20 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-surface text-muted">
        <Lock className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}
