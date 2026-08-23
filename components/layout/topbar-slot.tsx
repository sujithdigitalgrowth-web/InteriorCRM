export const TOPBAR_ACTIONS_ID = "topbar-actions";
export const TOPBAR_TITLE_ID = "topbar-title";

export function TopbarActionsSlot() {
  return <div id={TOPBAR_ACTIONS_ID} className="flex items-center gap-2" />;
}

export function TopbarTitleSlot() {
  return <div id={TOPBAR_TITLE_ID} className="flex min-w-0 items-center gap-2" />;
}
