import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { titleCase } from "@/lib/utils";
import type { Client } from "@prisma/client";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ClientInfoCard({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <Row label="Name" value={client.name} />
        <Row label="Type" value={titleCase(client.clientType)} />
        <Row label="Phone" value={client.phone} />
        <Row label="Email" value={client.email ?? "—"} />
        <Row label="City" value={client.city ?? "—"} />
        <Link
          href={`/clients/${client.id}`}
          className="mt-1 inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          View full client profile
        </Link>
      </CardContent>
    </Card>
  );
}
