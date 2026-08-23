import { Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { VendorLinkForm } from "@/components/projects/vendor-link-form";
import { removeProjectVendor } from "@/lib/actions/project-vendors";
import { formatCurrency, titleCase } from "@/lib/utils";
import type { ProjectVendor, Vendor } from "@prisma/client";

type LinkWithVendor = ProjectVendor & { vendor: Vendor };

export function VendorsTab({
  projectId,
  links,
  availableVendors,
}: {
  projectId: string;
  links: LinkWithVendor[];
  availableVendors: { id: string; name: string; category: string }[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <VendorLinkForm projectId={projectId} vendors={availableVendors} />
      </div>

      {links.length === 0 ? (
        <EmptyState icon={Hammer} title="No vendors linked yet" className="py-10" />
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{link.vendor.name}</p>
                  <Badge variant="outline">{titleCase(link.vendor.category)}</Badge>
                </div>
                {link.scope && <p className="mt-0.5 text-xs text-muted">{link.scope}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(link.poValue)}</p>
                <ConfirmDeleteButton
                  label=""
                  action={removeProjectVendor.bind(null, link.id, projectId)}
                  confirmMessage={`Remove ${link.vendor.name} from this project?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
