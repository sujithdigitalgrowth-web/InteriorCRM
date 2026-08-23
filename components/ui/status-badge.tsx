import { Badge } from "@/components/ui/badge";
import { statusVariant } from "@/lib/status";
import { titleCase } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant(status)} dot>
      {titleCase(status)}
    </Badge>
  );
}
