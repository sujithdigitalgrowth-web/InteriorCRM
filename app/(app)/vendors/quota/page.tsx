import Link from "next/link";
import { Truck, IndianRupee, Percent, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/auth/permissions";
import { NoPermission } from "@/components/ui/no-permission";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { VendorOrderCard } from "@/components/vendors/vendor-order-card";
import { VendorOrderItemDialog } from "@/components/vendors/vendor-order-item-dialog";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { VENDOR_ORDER_CATEGORY_OPTIONS, sumLineTotals } from "@/lib/vendor-order";
import { cn, formatCurrency } from "@/lib/utils";
import type { VendorOrderItem, Vendor, Project } from "@prisma/client";

const TABS = [{ key: "ALL", label: "Vendor Quota" }, ...VENDOR_ORDER_CATEGORY_OPTIONS.map((o) => ({ key: o.value, label: o.label }))];

type ItemWithRelations = VendorOrderItem & { vendor: Vendor; project: Project };

export default async function VendorQuotaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!(await can("vendorQuota"))) {
    return (
      <div>
        <PageHeader title="Vendor Quota" description="Purchase orders and GST tracking by vendor." />
        <NoPermission />
      </div>
    );
  }

  const { category: categoryParam } = await searchParams;
  const category = TABS.some((t) => t.key === categoryParam) ? categoryParam! : "ALL";
  const activeTab = TABS.find((t) => t.key === category)!;

  const [items, projects, vendors] = await Promise.all([
    prisma.vendorOrderItem.findMany({
      where: category === "ALL" ? {} : { category: category as "TRANSPORT" | "LABOR" | "MISCELLANEOUS" },
      include: { vendor: true, project: true },
      orderBy: [{ vendorId: "asc" }, { order: "asc" }],
    }),
    prisma.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const grouped = new Map<string, { vendor: Vendor; items: ItemWithRelations[] }>();
  for (const item of items) {
    const existing = grouped.get(item.vendorId);
    if (existing) existing.items.push(item);
    else grouped.set(item.vendorId, { vendor: item.vendor, items: [item] });
  }
  const vendorGroups = Array.from(grouped.values());

  const totals = sumLineTotals(items);
  const defaultCategory = category === "ALL" ? "MISCELLANEOUS" : category;

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        <Link href="/projects" className="hover:text-foreground">
          All Projects
        </Link>{" "}
        · {activeTab.label}
      </p>

      <PageHeader
        title="Vendor Quota"
        description="Purchase orders by vendor, grouped by category, with GST breakdown."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <VendorOrderItemDialog vendors={vendors} projects={projects} defaultCategory={defaultCategory} />
            <VendorFormDialog />
          </div>
        }
      />

      <div className="mb-6 inline-flex items-center gap-1 rounded-lg bg-surface-muted p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/vendors/quota" : `/vendors/quota?category=${t.key}`}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              category === t.key ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Vendors"
          value={String(vendorGroups.length)}
          icon={Truck}
          tone="primary"
          trendLabel={category === "ALL" ? "Across all categories" : `In ${activeTab.label}`}
        />
        <StatCard
          label="Total Value (with GST)"
          value={formatCurrency(totals.withGst)}
          icon={IndianRupee}
          tone="info"
          trendLabel="Across all orders"
        />
        <StatCard
          label="GST Amount"
          value={formatCurrency(totals.gstAmount)}
          icon={Percent}
          tone="ochre"
          trendLabel="Tax component"
        />
        <StatCard
          label="Without GST"
          value={formatCurrency(totals.withoutGst)}
          icon={Receipt}
          tone="sage"
          trendLabel="Base value"
          subtitleTone="sage"
        />
      </div>

      {vendorGroups.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No orders yet"
          description={`No ${activeTab.label.toLowerCase()} orders recorded yet.`}
          className="py-14"
        />
      ) : (
        <div className="space-y-6">
          {vendorGroups.map((g) => (
            <VendorOrderCard
              key={g.vendor.id}
              vendorId={g.vendor.id}
              vendorName={g.vendor.name}
              categoryLabel={category === "ALL" ? "All Categories" : activeTab.label}
              items={g.items}
              projects={projects}
              defaultCategory={defaultCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
