import { UserPlus, Receipt, FileSignature, CheckSquare, AlertTriangle, ArrowUpRight, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatActivityTime, type ActivityItem } from "@/lib/activity";

const ICONS = {
  client: { icon: UserPlus, tone: "text-info bg-info/10" },
  payment: { icon: Receipt, tone: "text-sage bg-sage/10" },
  agreement: { icon: FileSignature, tone: "text-primary-hover bg-primary/10" },
  milestone: { icon: CheckSquare, tone: "text-sage bg-sage/10" },
  "milestone-delayed": { icon: AlertTriangle, tone: "text-danger bg-danger/10" },
  project: { icon: ArrowUpRight, tone: "text-ochre bg-ochre/10" },
  quotation: { icon: FileText, tone: "text-info bg-info/10" },
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No activity yet" className="py-8" />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const { icon: Icon, tone } = ICONS[item.icon];
        return (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
                <Icon className="size-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
                {item.subtext && <p className="text-xs text-muted">{item.subtext}</p>}
              </div>
            </div>
            <span className="whitespace-nowrap text-xs text-muted">{formatActivityTime(item.timestamp)}</span>
          </div>
        );
      })}
    </div>
  );
}
