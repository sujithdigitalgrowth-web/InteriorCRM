import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NoPermission } from "@/components/ui/no-permission";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/lib/actions/settings";
import { can } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  if (!(await can("manageSettings"))) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Settings" description="Customize your studio's branding across the CRM." />
        <NoPermission />
      </div>
    );
  }

  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Customize your studio's branding across the CRM." />
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>

      <Link href="/settings/permissions" className="mt-6 block">
        <Card className="transition-colors hover:bg-surface-muted/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex-1">
              <CardTitle>Access & Permissions</CardTitle>
              <CardDescription>Control what Finance and Employee roles can see and manage.</CardDescription>
            </div>
            <ChevronRight className="size-4 text-muted" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
