import { statusVariant } from "@/lib/status";
import { cn, titleCase } from "@/lib/utils";

const DOT_COLOR: Record<string, string> = {
  primary: "var(--color-primary)",
  sage: "var(--color-sage)",
  ochre: "var(--color-ochre)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-border-strong)",
};

export function StatusDot({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-foreground", className)}>
      <span className="size-2 rounded-full" style={{ background: DOT_COLOR[statusVariant(status)] }} />
      {titleCase(status)}
    </span>
  );
}
