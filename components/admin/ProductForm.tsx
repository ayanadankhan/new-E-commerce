// UI: Full product create/edit form with react-hook-form, zod, and image uploads.

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { toast } from "sonner";
import type { Product } from "@/types";
import type { Category } from "@/types";

const formSchema = productSchema;
export type ProductFormValues = z.infer<typeof formSchema>;

export interface ProductFormProps {
  tenantId: string;
  categories: Category[];
  initial?: Product | null;
  onSaved?: () => void;
}

export function ProductForm({
  tenantId,
  categories,
  initial,
  onSaved,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description,
          price: initial.price,
          compareAtPrice: initial.compareAtPrice,
          costPerItem: initial.costPerItem,
          stock: initial.stock,
          weight: initial.weight,
          images: initial.images,
          categoryId: initial.categoryId,
          tenantId,
          isActive: initial.isActive,
          sku: initial.sku,
          barcode: initial.barcode ?? "",
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          stock: 0,
          images: [],
          categoryId: categories[0]?.id ?? "",
          tenantId,
          isActive: true,
          sku: "",
          barcode: "",
        },
  });

  async function onSubmit(values: ProductFormValues) {
    const url = initial
      ? `/api/products/${initial.id}`
      : "/api/products";
    const res = await fetch(url, {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Save failed");
      return;
    }
    toast.success("Product saved");
    onSaved?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[1fr_280px]"
      >
        <div className="space-y-4">
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compareAtPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compare at</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costPerItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <aside className="space-y-4 rounded-lg border border-border p-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel className="mb-2 block">Images</FormLabel>
            <ImageUploader
              onUploaded={(urls) => {
                const cur = form.getValues("images");
                form.setValue("images", [...cur, ...urls]);
              }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {form.watch("images").length} file(s) attached
            </p>
          </div>
          <Button type="submit" className="w-full">
            Save product
          </Button>
        </aside>
      </form>
    </Form>
  );
}
