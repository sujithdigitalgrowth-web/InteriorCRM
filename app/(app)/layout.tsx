import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSettings } from "@/lib/actions/settings";
import { getSessionMember } from "@/lib/auth/session";
import { hasAnyAdminAccount } from "@/lib/actions/auth";
import { getRolePermissions } from "@/lib/auth/permissions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const member = await getSessionMember();

  if (!member) {
    const hasAdmin = await hasAnyAdminAccount();
    redirect(hasAdmin ? "/login" : "/setup");
  }

  const [settings, permissions] = await Promise.all([getSettings(), getRolePermissions(member.accessRole)]);

  return (
    <>
      <Sidebar settings={settings} member={member} permissions={permissions} />
      <div className="md:pl-60 print:pl-0">
        <Topbar member={member} />
        <main className="px-4 pt-3 pb-6 md:px-8 print:p-0">{children}</main>
      </div>
    </>
  );
}
