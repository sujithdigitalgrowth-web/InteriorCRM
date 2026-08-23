export type DateRange = "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear" | "allTime" | "custom";

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function greeting(now: Date = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function resolveDateRange(
  range: DateRange,
  now: Date = new Date(),
  custom?: { from: Date; to: Date }
) {
  if (range === "custom" && custom) {
    return { start: custom.from, end: new Date(custom.to.getTime() + 86400000) };
  }
  if (range === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  if (range === "thisQuarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 1);
    return { start, end };
  }
  if (range === "thisYear") {
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear() + 1, 0, 1) };
  }
  if (range === "allTime") {
    return { start: new Date(2000, 0, 1), end: new Date(now.getFullYear() + 1, 0, 1) };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

const RANGE_LABELS: Record<DateRange, string> = {
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisQuarter: "This Quarter",
  thisYear: "This Year",
  allTime: "All Time",
  custom: "Custom Range",
};

export function formatDateRangeLabel(
  range: DateRange,
  now: Date = new Date(),
  custom?: { from: Date; to: Date }
) {
  const { start, end } = resolveDateRange(range, now, custom);
  const inclusiveEnd = new Date(end.getTime() - 86400000);
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  if (range === "allTime") return RANGE_LABELS[range];
  if (range === "custom" && !custom) return RANGE_LABELS[range];
  return `${fmt.format(start)} - ${fmt.format(inclusiveEnd)}`;
}

export const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisQuarter", label: "This Quarter" },
  { key: "thisYear", label: "This Year" },
  { key: "allTime", label: "All Time" },
];

export const TREND_COMPARISON_LABEL: Record<DateRange, string> = {
  thisMonth: "vs last month",
  lastMonth: "vs month before",
  thisQuarter: "vs last quarter",
  thisYear: "vs last year",
  allTime: "",
  custom: "vs before this range",
};
