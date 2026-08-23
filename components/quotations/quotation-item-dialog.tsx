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
import { createQuotationItem, updateQuotationItem } from "@/lib/actions/quotations";
import type { QuotationItem } from "@prisma/client";

const NOTE_PRESETS = ["By builder", "On Actuals", "TBD"];

export function QuotationItemDialog({ quotationId, item }: { quotationId: string; item?: QuotationItem }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [pricingType, setPricingType] = React.useState<"FIXED" | "NOTE">(
    item && item.amount === null ? "NOTE" : "FIXED"
  );
  const [length, setLength] = React.useState(item?.lengthFt?.toString() ?? "");
  const [breadth, setBreadth] = React.useState(item?.breadthFt?.toString() ?? "");
  const [area, setArea] = React.useState(item?.areaOrQty?.toString() ?? "");
  const isEdit = Boolean(item);

  function handleLengthChange(value: string) {
    setLength(value);
    const l = parseFloat(value);
    const b = parseFloat(breadth);
    if (!isNaN(l) && !isNaN(b)) setArea((l * b).toFixed(2));
  }

  function handleBreadthChange(value: string) {
    setBreadth(value);
    const l = parseFloat(length);
    const b = parseFloat(value);
    if (!isNaN(l) && !isNaN(b)) setArea((l * b).toFixed(2));
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (item) {
        await updateQuotationItem(item.id, quotationId, formData);
        toast.success("Line item updated");
      } else {
        await createQuotationItem(quotationId, formData);
        toast.success("Line item added");
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
          <Button variant="ghost" size="icon" aria-label="Edit item">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Line Item" : "Add Line Item"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this line item." : "Add a room-wise costing line to this quotation."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="room">Room *</Label>
              <Input id="room" name="room" required placeholder="e.g. Kitchen" defaultValue={item?.room} />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                name="description"
                required
                placeholder="e.g. Lower unit L shape"
                defaultValue={item?.description}
              />
            </div>
            <div>
              <Label htmlFor="lengthFt">Length (L)</Label>
              <Input
                id="lengthFt"
                name="lengthFt"
                type="number"
                min={0}
                step="0.01"
                value={length}
                onChange={(e) => handleLengthChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="breadthFt">Breadth (B)</Label>
              <Input
                id="breadthFt"
                name="breadthFt"
                type="number"
                min={0}
                step="0.01"
                value={breadth}
                onChange={(e) => handleBreadthChange(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="areaOrQty">Covered Area (sft) / Qty</Label>
              <Input
                id="areaOrQty"
                name="areaOrQty"
                type="number"
                min={0}
                step="0.01"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">Auto-filled from L × B — override for quantity-based lines.</p>
            </div>
            <div className="col-span-2">
              <Label htmlFor="pricingType">Pricing</Label>
              <Select
                id="pricingType"
                name="pricingType"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as "FIXED" | "NOTE")}
              >
                <option value="FIXED">Fixed Amount</option>
                <option value="NOTE">Text Note (By builder, On Actuals, TBD…)</option>
              </Select>
            </div>
            {pricingType === "FIXED" ? (
              <div className="col-span-2">
                <Label htmlFor="amount">Final Total (₹) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  defaultValue={item?.amount ?? 0}
                />
              </div>
            ) : (
              <div className="col-span-2">
                <Label htmlFor="amountNote">Note *</Label>
                <Input
                  id="amountNote"
                  name="amountNote"
                  required
                  list="quotation-note-presets"
                  placeholder="e.g. By builder"
                  defaultValue={item?.amountNote ?? ""}
                />
                <datalist id="quotation-note-presets">
                  {NOTE_PRESETS.map((preset) => (
                    <option key={preset} value={preset} />
                  ))}
                </datalist>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
