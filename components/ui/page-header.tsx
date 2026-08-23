import * as React from "react";
import { TopbarPortal } from "@/components/layout/topbar-portal";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <TopbarPortal target="title">
        <h1 className="truncate font-display text-2xl font-medium tracking-tight text-foreground">{title}</h1>
      </TopbarPortal>
      {action && <TopbarPortal>{action}</TopbarPortal>}
      {description && <p className="mb-5 border-b border-border pb-4 text-sm text-muted">{description}</p>}
    </>
  );
}
