// UI: Modal form to create or edit a category with slug and optional image URL.

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  image: z.string().url().optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof schema>;

export interface CategoryFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenantId: string;
  initial?: Partial<CategoryFormValues>;
  onDone?: () => void;
}

export function CategoryForm({
  open,
  onOpenChange,
  tenantId,
  initial,
  onDone,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      image: initial?.image ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? "",
        slug: initial?.slug ?? "",
        image: initial?.image ?? "",
      });
    }
  }, [open, initial, form]);

  async function onSubmit(values: CategoryFormValues) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        name: values.name,
        slug: values.slug,
        image: values.image || undefined,
      }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Failed");
      return;
    }
    toast.success("Category saved");
    onOpenChange(false);
    onDone?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
