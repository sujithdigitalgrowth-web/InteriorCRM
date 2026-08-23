import { cn, initials } from "@/lib/utils";

const PALETTE = ["#3d5a73", "#6f8f6a", "#4f7fa8", "#c9a24e", "#7d6f9e", "#4a9d8f"];

export function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-11 text-sm" }[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dims,
        className
      )}
      style={{ backgroundColor: colorFor(name) }}
      title={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
