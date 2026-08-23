import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientHeader } from "@/components/clients/client-header";
import { AboutClientCard } from "@/components/clients/about-client-card";
import { ContactPersonsCard } from "@/components/clients/contact-persons-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ClientTimeline } from "@/components/clients/client-timeline";
import { ClientProjectsList, type ClientProjectRow } from "@/components/clients/client-projects-list";
import { ClientQuotesCard, type QuoteRow } from "@/components/clients/client-quotes-card";
import { ClientPaymentsCard, type ClientPaymentRow } from "@/components/clients/client-payments-card";
import { PaymentsSummaryChart } from "@/components/clients/payments-summary-chart";
import { ClientNotesCard } from "@/components/clients/client-notes-card";
import { NoPermission } from "@/components/ui/no-permission";
import { buildRecentActivity } from "@/lib/activity";
import { can } from "@/lib/auth/permissions";
import { computeQuotationTotals } from "@/lib/quotation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      contactPersons: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          transactions: true,
          quotations: { include: { items: true }, orderBy: { updatedAt: "desc" } },
          milestones: { where: { status: "DONE" }, orderBy: { completedAt: "desc" } },
        },
      },
      agreements: { orderBy: { updatedAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const hasRevenue = await can("revenue");

  const isActiveProject = (p: { status: string }) => !["COMPLETED", "CANCELLED"].includes(p.status);

  const projectRows: ClientProjectRow[] = client.projects.map((p) => {
    const paid = p.transactions
      .filter((t) => t.type === "CLIENT_PAYMENT" && t.status === "PAID")
      .reduce((sum, t) => sum + t.amount, 0);
    const due = Math.max((p.budget ?? 0) - paid, 0);
    const paidPct = p.budget ? Math.round((paid / p.budget) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      type: p.type,
      city: p.city,
      startDate: p.startDate,
      targetEndDate: p.targetEndDate,
      budget: p.budget,
      paid,
      due,
      paidPct,
    };
  });

  const projectCount = client.projects.length;
  const activeProjectCount = client.projects.filter(isActiveProject).length;
  const totalValue = client.projects.reduce((sum, p) => sum + (p.budget ?? 0), 0);

  const clientPayments = client.transactions.filter((t) => t.type === "CLIENT_PAYMENT");
  const receivedAmount = clientPayments.filter((t) => t.status === "PAID").reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = clientPayments
    .filter((t) => t.status === "PENDING" || t.status === "OVERDUE")
    .reduce((sum, t) => sum + t.amount, 0);

  const quotes: QuoteRow[] = client.projects
    .flatMap((p) =>
      p.quotations.map((q) => ({
        id: q.id,
        label: q.title || q.quotationNumber,
        status: q.status,
        total: computeQuotationTotals(q.items, q.discountPct).finalAmount,
        updatedAt: q.updatedAt,
      }))
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const paymentRows: ClientPaymentRow[] = clientPayments.map((t) => ({
    id: t.id,
    reference: t.reference,
    status: t.status,
    amount: t.amount,
    dueDate: t.dueDate,
    paidDate: t.paidDate,
  }));

  const activity = buildRecentActivity({
    clients: [{ id: client.id, name: client.name, createdAt: client.createdAt }],
    payments: hasRevenue
      ? clientPayments
          .filter((t) => t.status === "PAID" && t.paidDate)
          .map((t) => ({ id: t.id, amount: t.amount, paidDate: t.paidDate, client: { name: client.name } }))
      : [],
    agreements: client.agreements.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      updatedAt: a.updatedAt,
    })),
    milestones: client.projects.flatMap((p) =>
      p.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        completedAt: m.completedAt,
        updatedAt: m.updatedAt,
        project: { name: p.name },
      }))
    ),
    projects: client.projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  });

  return (
    <div>
      <ClientHeader
        client={client}
        projectCount={projectCount}
        activeProjectCount={activeProjectCount}
        totalValue={totalValue}
        receivedAmount={receivedAmount}
        hasRevenue={hasRevenue}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AboutClientCard client={client} />
            <ContactPersonsCard clientId={client.id} contacts={client.contactPersons} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed items={activity.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientProjectsList projects={projectRows.slice(0, 3)} hasRevenue={hasRevenue} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Client Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientTimeline items={activity} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ClientQuotesCard quotes={quotes.slice(0, 3)} />
            {hasRevenue ? (
              <>
                <ClientPaymentsCard payments={paymentRows.slice(0, 3)} />
                <Card>
                  <CardHeader>
                    <CardTitle>Payments Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentsSummaryChart paid={receivedAmount} pending={pendingAmount} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NoPermission />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="mt-6">
            <ClientNotesCard notes={client.notes} />
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>All Projects ({projectRows.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientProjectsList projects={projectRows} hasRevenue={hasRevenue} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <ClientQuotesCard quotes={quotes} />
        </TabsContent>

        <TabsContent value="payments">
          {hasRevenue ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ClientPaymentsCard payments={paymentRows} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Payments Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentsSummaryChart paid={receivedAmount} pending={pendingAmount} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <NoPermission />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <ClientNotesCard notes={client.notes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
