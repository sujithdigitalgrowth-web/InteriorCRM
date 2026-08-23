import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { hasAnyAdminAccount } from "@/lib/actions/auth";
import { SetupForm } from "@/app/setup/setup-form";

export default async function SetupPage() {
  const hasAdmin = await hasAnyAdminAccount();
  if (hasAdmin) redirect("/login");

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Compass className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground">Create the admin account</h1>
          <p className="text-sm text-muted">This is a one-time setup. This account gets full access.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <SetupForm />
        </div>
      </div>
    </div>
  );
}
