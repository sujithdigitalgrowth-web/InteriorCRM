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
import { Textarea } from "@/components/ui/textarea";
import { createVendor, updateVendor } from "@/lib/actions/vendors";
import type { Vendor } from "@prisma/client";

const CATEGORIES = [
  ["FURNITURE", "Furniture"],
  ["ELECTRICAL", "Electrical"],
  ["PLUMBING", "Plumbing"],
  ["CIVIL", "Civil"],
  ["CARPENTRY", "Carpentry"],
  ["PAINTING", "Painting"],
  ["FLOORING", "Flooring"],
  ["LIGHTING", "Lighting"],
  ["SOFT_FURNISHING", "Soft Furnishing"],
  ["MODULAR_KITCHEN", "Modular Kitchen"],
  ["GLASS_METAL", "Glass & Metal"],
  ["OTHER", "Other"],
] as const;

export function VendorFormDialog({ vendor }: { vendor?: Vendor }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(vendor);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (vendor) {
        await updateVendor(vendor.id, formData);
        toast.success("Vendor updated");
        setOpen(false);
      } else {
        await createVendor(formData);
      }
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
          <Button variant="outline" size="sm">
            <Pencil /> Edit
          </Button>
        ) : (
          <Button>
            <Plus /> New Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vendor" : "New Vendor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update vendor details." : "Add a vendor or contractor to the studio directory."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Vendor / Company name *</Label>
              <Input id="name" name="name" required defaultValue={vendor?.name} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" name="category" defaultValue={vendor?.category ?? "OTHER"}>
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" name="contactName" defaultValue={vendor?.contactName ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required defaultValue={vendor?.phone} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={vendor?.email ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" rows={2} defaultValue={vendor?.address ?? ""} />
            </div>
            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" name="gstin" defaultValue={vendor?.gstin ?? ""} />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input id="paymentTerms" name="paymentTerms" placeholder="e.g. 30% advance, 70% on delivery" defaultValue={vendor?.paymentTerms ?? ""} />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1–5)</Label>
              <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={vendor?.rating ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={vendor?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
