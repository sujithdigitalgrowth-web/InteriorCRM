"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { TOPBAR_ACTIONS_ID, TOPBAR_TITLE_ID } from "@/components/layout/topbar-slot";

export function TopbarPortal({
  children,
  target = "actions",
}: {
  children: React.ReactNode;
  target?: "actions" | "title";
}) {
  const id = target === "title" ? TOPBAR_TITLE_ID : TOPBAR_ACTIONS_ID;
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // The target div is already in the server-rendered HTML; this only defers the
    // lookup to the client so server and first client render both output null
    // (document isn't available during SSR), avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(document.getElementById(id));
  }, [id]);

  if (!container) return null;
  return createPortal(children, container);
}
