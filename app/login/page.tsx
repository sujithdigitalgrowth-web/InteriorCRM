import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { getSessionMember } from "@/lib/auth/session";
import { hasAnyAdminAccount } from "@/lib/actions/auth";
import { LoginForm } from "@/app/login/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const member = await getSessionMember();
  if (member) redirect("/");

  const hasAdmin = await hasAnyAdminAccount();
  if (!hasAdmin) redirect("/setup");

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Compass className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground">Sign in to ROAR</h1>
          <p className="text-sm text-muted">Enter your team email and password to continue.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
