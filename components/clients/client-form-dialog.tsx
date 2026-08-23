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
import { createClient, updateClient } from "@/lib/actions/clients";
import { formatDateInput } from "@/lib/utils";
import type { Client } from "@prisma/client";

export function ClientFormDialog({ client, trigger }: { client?: Client; trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const isEdit = Boolean(client);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (client) {
        await updateClient(client.id, formData);
        toast.success("Client updated");
        setOpen(false);
      } else {
        await createClient(formData);
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
        {trigger ??
          (isEdit ? (
            <Button variant="outline" size="sm">
              <Pencil /> Edit
            </Button>
          ) : (
            <Button>
              <Plus /> New Client
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "New Client"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update client details." : "Add a lead or client to the studio CRM."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full name / Company *</Label>
              <Input id="name" name="name" required defaultValue={client?.name} />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required defaultValue={client?.phone} />
            </div>
            <div>
              <Label htmlFor="altPhone">Alt. Phone</Label>
              <Input id="altPhone" name="altPhone" defaultValue={client?.altPhone ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={client?.city ?? ""} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={client?.status ?? "LEAD"}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="PAST">Past</option>
                <option value="ON_HOLD">On Hold</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientType">Client Type</Label>
              <Select id="clientType" name="clientType" defaultValue={client?.clientType ?? "INDIVIDUAL"}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select id="source" name="source" defaultValue={client?.source ?? "OTHER"}>
                <option value="REFERRAL">Referral</option>
                <option value="WEBSITE">Website</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="EXHIBITION">Exhibition</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="companyName">Company / Organization</Label>
              <Input id="companyName" name="companyName" defaultValue={client?.companyName ?? ""} />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" name="occupation" defaultValue={client?.occupation ?? ""} />
            </div>
            <div>
              <Label htmlFor="preferredCommunication">Preferred Communication</Label>
              <Input
                id="preferredCommunication"
                name="preferredCommunication"
                placeholder="Email, WhatsApp…"
                defaultValue={client?.preferredCommunication ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="referredBy">Referred By</Label>
              <Input id="referredBy" name="referredBy" defaultValue={client?.referredBy ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="anniversary">Anniversary</Label>
              <Input
                id="anniversary"
                name="anniversary"
                type="date"
                defaultValue={formatDateInput(client?.anniversary)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" rows={2} defaultValue={client?.address ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={client?.notes ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
