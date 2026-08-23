import { Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
}

export function QuickContactCard({ phone, email }: { phone: string; email: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
            <Phone className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Call client</p>
            <p className="text-xs text-muted">{phone}</p>
          </div>
        </a>
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
              <Mail className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Email client</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </a>
        )}
        <a
          href={whatsappHref(phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-muted"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
            <MessageCircle className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">WhatsApp</p>
            <p className="text-xs text-muted">Message on WhatsApp</p>
          </div>
        </a>
      </CardContent>
    </Card>
  );
}
