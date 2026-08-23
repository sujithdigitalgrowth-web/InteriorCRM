import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { ContactPersonFormDialog } from "@/components/clients/contact-person-form-dialog";
import { deleteContactPerson } from "@/lib/actions/contact-persons";
import type { ContactPerson } from "@prisma/client";

export function ContactPersonsCard({ clientId, contacts }: { clientId: string; contacts: ContactPerson[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Contact Persons</CardTitle>
        <ContactPersonFormDialog clientId={clientId} />
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <EmptyState title="No additional contacts" description="Add a spouse or secondary contact." className="py-6" />
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Avatar name={c.name} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      {c.isPrimary && <Badge variant="primary">Primary</Badge>}
                    </div>
                    {c.phone && <p className="text-xs text-muted">{c.phone}</p>}
                    {c.email && <p className="text-xs text-muted">{c.email}</p>}
                  </div>
                </div>
                <ConfirmDeleteButton
                  label=""
                  action={deleteContactPerson.bind(null, c.id, clientId)}
                  confirmMessage={`Remove ${c.name} as a contact?`}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
