import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, FolderKanban, Receipt, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { deleteVendor } from "@/lib/actions/vendors";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      projectLinks: { include: { project: true }, orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vendor) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/vendors" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Vendors
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={vendor.name} size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{vendor.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">{titleCase(vendor.category)}</Badge>
              {vendor.rating && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Star className="size-3 fill-ochre text-ochre" /> {vendor.rating}/5
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <VendorFormDialog vendor={vendor} />
          <ConfirmDeleteButton
            action={deleteVendor.bind(null, vendor.id)}
            confirmMessage={`Delete ${vendor.name}? This will also remove their project links and payment records.`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {vendor.contactName && (
              <div className="text-foreground">{vendor.contactName}</div>
            )}
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="size-3.5 text-muted" /> {vendor.phone}
            </div>
            {vendor.email && (
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="size-3.5 text-muted" /> {vendor.email}
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start gap-2 text-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted" />
                <span>{vendor.address}</span>
              </div>
            )}
            <div className="space-y-1.5 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">GSTIN</span>
                <span className="text-foreground">{vendor.gstin || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Payment Terms</span>
                <span className="text-foreground">{vendor.paymentTerms || "—"}</span>
              </div>
            </div>
            {vendor.notes && (
              <div className="border-t border-border pt-3 text-muted">{vendor.notes}</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Linked Projects ({vendor.projectLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.projectLinks.length === 0 ? (
                <EmptyState icon={FolderKanban} title="No linked projects yet" className="py-8" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>PO Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.projectLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <Link href={`/projects/${link.projectId}`} className="font-medium text-foreground hover:text-primary">
                            {link.project.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted">{link.scope || "—"}</TableCell>
                        <TableCell className="text-foreground">{formatCurrency(link.poValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.transactions.length === 0 ? (
                <EmptyState icon={Receipt} title="No payment records yet" className="py-8" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-foreground">{formatCurrency(t.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={t.status} />
                        </TableCell>
                        <TableCell className="text-muted">{formatDate(t.dueDate)}</TableCell>
                        <TableCell className="text-muted">{formatDate(t.paidDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
