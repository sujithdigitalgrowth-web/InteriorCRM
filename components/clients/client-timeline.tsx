import { EmptyState } from "@/components/ui/empty-state";
import { formatActivityTime, type ActivityItem } from "@/lib/activity";

export function ClientTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No activity yet" className="py-8" />;
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[1.4rem] top-1 size-2 rounded-full border-2 border-surface bg-primary" />
          <p className="text-xs text-muted">{formatActivityTime(item.timestamp)}</p>
          <p className="text-sm font-medium text-foreground">{item.text}</p>
          {item.subtext && <p className="text-xs text-muted">{item.subtext}</p>}
        </li>
      ))}
    </ol>
  );
}
