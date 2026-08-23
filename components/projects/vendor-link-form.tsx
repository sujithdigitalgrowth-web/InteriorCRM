"use client";

import * as React from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { linkVendor } from "@/lib/actions/project-vendors";
import { titleCase } from "@/lib/utils";

export function VendorLinkForm({
  projectId,
  vendors,
}: {
  projectId: string;
  vendors: { id: string; name: string; category: string }[];
}) {
  const [pending, setPending] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (!formData.get("vendorId")) {
      toast.error("Pick a vendor first");
      return;
    }
    setPending(true);
    try {
      await linkVendor(projectId, formData);
      toast.success("Vendor linked");
      formRef.current?.reset();
    } catch {
      toast.error("Could not link vendor");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[12rem] flex-1">
        <Select name="vendorId" defaultValue="" required>
          <option value="" disabled>
            Select vendor
          </option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {titleCase(v.category)}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[10rem]">
        <Input name="scope" placeholder="Scope (e.g. Modular kitchen)" />
      </div>
      <div className="w-32">
        <Input name="poValue" type="number" step="any" placeholder="PO value" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        <Link2 /> {pending ? "Linking…" : "Link Vendor"}
      </Button>
    </form>
  );
}
