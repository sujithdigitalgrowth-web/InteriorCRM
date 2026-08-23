"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createVendorOrderItem, updateVendorOrderItem } from "@/lib/actions/vendor-orders";
import { VENDOR_ORDER_CATEGORY_OPTIONS } from "@/lib/vendor-order";
import type { VendorOrderItem } from "@prisma/client";

type ProjectOption = { id: string; name: string };

export function VendorOrderItemDialog({
  vendorId,
  vendorName,
  vendors,
  projects,
  defaultCategory,
  item,
}: {
  vendorId?: string;
  vendorName?: string;
  vendors?: ProjectOption[];
  projects: ProjectOption[];
  defaultCategory: string;
  item?: VendorOrderItem;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(item);
  const fixedVendor = Boolean(vendorId);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (item) {
        await updateVendorOrderItem(item.id, formData);
        toast.success("Row updated");
      } else {
        await createVendorOrderItem(formData);
        toast.success("Row added");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Check the required fields.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit row">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus /> Add Row
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Row" : "Add Row"}</DialogTitle>
          <DialogDescription>
            {fixedVendor
              ? isEdit
                ? `Update this line item for ${vendorName}.`
                : `Add a billable line item for ${vendorName}.`
              : "Add a billable line item for any vendor."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {fixedVendor && <input type="hidden" name="vendorId" value={vendorId} />}
          <div className="grid grid-cols-2 gap-4">
            {!fixedVendor && (
              <div className="col-span-2">
                <Label htmlFor="vendorId">Vendor *</Label>
                <Select id="vendorId" name="vendorId" required defaultValue={item?.vendorId ?? ""}>
                  <option value="" disabled>
                    Select a vendor
                  </option>
                  {vendors?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="col-span-2">
              <Label htmlFor="projectId">Project / Site *</Label>
              <Select id="projectId" name="projectId" required defaultValue={item?.projectId ?? ""}>
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select id="category" name="category" required defaultValue={item?.category ?? defaultCategory}>
                {VENDOR_ORDER_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="itemName">Item *</Label>
              <Input
                id="itemName"
                name="itemName"
                required
                placeholder="e.g. Steel delivery"
                defaultValue={item?.itemName}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate (₹) *</Label>
              <Input id="rate" name="rate" type="number" min={0} step="0.01" required defaultValue={item?.rate ?? 0} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={item?.quantity ?? 1}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="discountPct">Discount %</Label>
              <Input
                id="discountPct"
                name="discountPct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                defaultValue={item?.discountPct ?? 0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Row"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
