import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, titleCase } from "@/lib/utils";
import type { Client } from "@prisma/client";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function AboutClientCard({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Client</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Client Type" value={titleCase(client.clientType)} />
        <Field label="Company / Organization" value={client.companyName} />
        <Field label="Occupation" value={client.occupation} />
        <Field label="Preferred Communication" value={client.preferredCommunication} />
        <Field label="Anniversary" value={client.anniversary ? formatDate(client.anniversary) : undefined} />
        <Field label="Referred By" value={client.referredBy} />
        <div className="col-span-2">
          <p className="text-xs text-muted">Notes</p>
          <p className="mt-1 text-sm text-foreground">{client.notes || "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
