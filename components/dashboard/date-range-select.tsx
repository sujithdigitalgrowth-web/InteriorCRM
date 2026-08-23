"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATE_RANGE_OPTIONS, formatDateRangeLabel, type DateRange } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

function toInputValue(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function parseLocalDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DateRangeSelect({ range, from, to }: { range: DateRange; from?: string; to?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [fromValue, setFromValue] = React.useState(toInputValue(from));
  const [toValue, setToValue] = React.useState(toInputValue(to));

  const customLabel =
    range === "custom" && from && to
      ? formatDateRangeLabel(range, new Date(), { from: parseLocalDate(from), to: parseLocalDate(to) })
      : formatDateRangeLabel(range);

  function applyCustomRange(e: React.FormEvent) {
    e.preventDefault();
    if (!fromValue || !toValue) return;
    router.push(`/?range=custom&from=${fromValue}&to=${toValue}`);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-muted">
          <CalendarDays className="size-3.5 text-muted" />
          {customLabel}
          <ChevronDown className="size-3.5 text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {DATE_RANGE_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.key} asChild>
            <Link
              href={opt.key === "thisMonth" ? "/" : `/?range=${opt.key}`}
              className={cn(opt.key === range && "bg-surface-muted font-medium")}
            >
              {opt.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2.5 py-1.5">
          <p className={cn("mb-2 text-xs font-medium", range === "custom" ? "text-foreground" : "text-muted")}>
            Custom Range
          </p>
          <form onSubmit={applyCustomRange} className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div>
              <Label htmlFor="date-range-from" className="mb-1 text-[11px]">
                From
              </Label>
              <Input
                id="date-range-from"
                type="date"
                value={fromValue}
                max={toValue || undefined}
                onChange={(e) => setFromValue(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="date-range-to" className="mb-1 text-[11px]">
                To
              </Label>
              <Input
                id="date-range-to"
                type="date"
                value={toValue}
                min={fromValue || undefined}
                onChange={(e) => setToValue(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button type="submit" size="sm" className="w-full" disabled={!fromValue || !toValue}>
              Apply
            </Button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
