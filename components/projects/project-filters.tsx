"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";
import { PROJECT_TYPE_OPTIONS, PROJECT_STATUS_OPTIONS } from "@/lib/project-options";

export function ProjectFilters({ status, type }: { status: string; type: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => updateParam("status", e.target.value)}
        className="w-full sm:w-44"
      >
        <option value="ALL">All Statuses</option>
        {PROJECT_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by type"
        value={type}
        onChange={(e) => updateParam("type", e.target.value)}
        className="w-full sm:w-52"
      >
        <option value="ALL">All Types</option>
        {PROJECT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
