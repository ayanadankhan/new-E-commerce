// UI: Client form to update tenant name, contact, currency, and timezone.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Tenant } from "@/types";
import { CURRENCIES, TIMEZONES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SettingsGeneralForm({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [name, setName] = React.useState(tenant.name);
  const [desc, setDesc] = React.useState(tenant.description ?? "");
  const [email, setEmail] = React.useState(tenant.contactEmail ?? "");
  const [currency, setCurrency] = React.useState(tenant.currency);
  const [timezone, setTimezone] = React.useState(tenant.timezone);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/tenants/${tenant.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: tenant.slug,
        currency,
        timezone,
        description: desc,
        contactEmail: email,
      }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Save failed");
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="name">Store name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1" rows={3} />
      </div>
      <div>
        <Label htmlFor="cemail">Contact email</Label>
        <Input
          id="cemail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
