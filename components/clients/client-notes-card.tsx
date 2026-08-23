import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function ClientNotesCard({ notes }: { notes: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes ? (
          <p className="text-sm text-foreground">{notes}</p>
        ) : (
          <EmptyState title="No notes yet" description="Add notes from the Edit Client form." className="py-6" />
        )}
      </CardContent>
    </Card>
  );
}
