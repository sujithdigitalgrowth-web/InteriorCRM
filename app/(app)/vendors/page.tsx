import Link from "next/link";
import { Truck, Layers, Star, FolderKanban, Phone, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { titleCase } from "@/lib/utils";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projectLinks: true } } },
  });

  const categoryCount = new Set(vendors.map((v) => v.category)).size;
  const ratedVendors = vendors.filter((v) => v.rating != null);
  const avgRating = ratedVendors.length
    ? ratedVendors.reduce((sum, v) => sum + (v.rating ?? 0), 0) / ratedVendors.length
    : 0;
  const linkedProjects = vendors.reduce((sum, v) => sum + v._count.projectLinks, 0);

  return (
    <div>
      <PageHeader
        title="Vendors"
        description={`${vendors.length} vendors & contractors in the studio directory`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/vendors/quota" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Receipt /> Vendor Quota
            </Link>
            <VendorFormDialog />
          </div>
        }
      />

      {vendors.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Vendors"
            value={String(vendors.length)}
            icon={Truck}
            tone="primary"
            trendLabel={`${vendors.length} in directory`}
          />
          <StatCard
            label="Categories"
            value={String(categoryCount)}
            icon={Layers}
            tone="info"
            trendLabel="Trade categories"
          />
          <StatCard
            label="Avg Rating"
            value={ratedVendors.length ? `${avgRating.toFixed(1)}/5` : "—"}
            icon={Star}
            tone="ochre"
            trendLabel={`${ratedVendors.length} rated`}
          />
          <StatCard
            label="Project Links"
            value={String(linkedProjects)}
            icon={FolderKanban}
            tone="sage"
            trendLabel="Active engagements"
            subtitleTone="sage"
          />
        </div>
      )}

      {vendors.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vendors yet"
          description="Add your first vendor or contractor to get started."
          action={<VendorFormDialog />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id} className="group">
                <TableCell>
                  <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-3">
                    <Avatar name={vendor.name} size="sm" />
                    <span className="font-medium text-foreground group-hover:text-primary">
                      {vendor.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{titleCase(vendor.category)}</Badge>
                </TableCell>
                <TableCell className="text-muted">
                  {vendor.contactName && (
                    <div className="text-xs">{vendor.contactName}</div>
                  )}
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                    <Phone className="size-3" /> {vendor.phone}
                  </div>
                </TableCell>
                <TableCell className="text-muted">
                  {vendor.rating ? (
                    <span className="flex items-center gap-1 text-xs">
                      <Star className="size-3 fill-ochre text-ochre" /> {vendor.rating}/5
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted">{vendor._count.projectLinks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
