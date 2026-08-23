"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSettings } from "@/lib/actions/settings";
import type { Settings } from "@prisma/client";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await updateSettings(formData);
      toast.success("Settings saved");
    } catch {
      toast.error("Something went wrong. Check the required fields.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input id="businessName" name="businessName" required defaultValue={settings.businessName} />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" placeholder="e.g. Architecture" defaultValue={settings.tagline} />
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" name="logoUrl" placeholder="https://…" defaultValue={settings.logoUrl ?? ""} />
        <p className="mt-1 text-xs text-muted">Leave blank to use the default icon.</p>
      </div>
      <div>
        <Label htmlFor="address">Business Address</Label>
        <Textarea
          id="address"
          name="address"
          rows={2}
          placeholder="Shown on the footer of quotations and other documents"
          defaultValue={settings.address ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" placeholder="www.example.com" defaultValue={settings.website ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="quote">Sidebar Quote</Label>
        <Textarea id="quote" name="quote" rows={2} defaultValue={settings.quote} />
      </div>
      <div>
        <Label htmlFor="quoteAuthor">Quote Author</Label>
        <Input id="quoteAuthor" name="quoteAuthor" defaultValue={settings.quoteAuthor} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
