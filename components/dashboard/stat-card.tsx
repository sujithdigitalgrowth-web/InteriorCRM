import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  tone = "primary",
  subtitleTone = "muted",
  invertTrend = false,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  trend?: number;
  trendLabel?: string;
  tone?: "primary" | "sage" | "ochre" | "info" | "danger";
  subtitleTone?: "muted" | "primary" | "sage" | "ochre" | "info" | "danger";
  invertTrend?: boolean;
  href?: string;
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary-hover",
    sage: "bg-sage/10 text-sage",
    ochre: "bg-ochre/10 text-ochre",
    info: "bg-info/10 text-info",
    danger: "bg-danger/10 text-danger",
  };
  const subtitleToneClasses: Record<string, string> = {
    muted: "text-muted",
    primary: "text-primary-hover",
    sage: "text-sage",
    ochre: "text-ochre",
    info: "text-info",
    danger: "text-danger",
  };

  const isGood = trend !== undefined ? (invertTrend ? trend <= 0 : trend >= 0) : true;

  const content = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
        {Icon && (
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", toneClasses[tone])}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <p className="mt-3 font-sans text-[1.75rem] leading-none font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {trend !== undefined ? (
        <p className="mt-3 text-xs font-semibold">
          <span className={isGood ? "text-sage" : "text-danger"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>{" "}
          <span className="font-normal text-muted">{trendLabel}</span>
        </p>
      ) : trendLabel ? (
        <p className={cn("mt-3 text-xs font-semibold", subtitleToneClasses[subtitleTone])}>{trendLabel}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="p-5 transition-colors hover:bg-surface-muted">{content}</Card>
      </Link>
    );
  }

  return <Card className="p-5">{content}</Card>;
}
