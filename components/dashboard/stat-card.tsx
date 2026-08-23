import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const ruleToneClasses: Record<string, string> = {
    primary: "bg-primary",
    sage: "bg-sage",
    ochre: "bg-ochre",
    info: "bg-info",
    danger: "bg-danger",
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
      <div className={cn("h-[3px] w-8 rounded-full", ruleToneClasses[tone])} />
      <div className="mt-3 flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 shrink-0 text-muted" />}
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-[1.75rem] leading-none font-medium tracking-tight text-foreground">
        {value}
      </p>
      {trend !== undefined ? (
        <p className="mt-2.5 text-xs font-medium">
          <span className={isGood ? "text-sage" : "text-danger"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>{" "}
          <span className="font-normal text-muted">{trendLabel}</span>
        </p>
      ) : trendLabel ? (
        <p className={cn("mt-2.5 text-xs font-medium", subtitleToneClasses[subtitleTone])}>{trendLabel}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group block border-b border-border pb-4 transition-colors hover:border-border-strong">
        {content}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100">
          View <ArrowUpRight className="size-3" />
        </span>
      </Link>
    );
  }

  return <div className="border-b border-border pb-4">{content}</div>;
}
