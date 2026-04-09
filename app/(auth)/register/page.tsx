// PURPOSE: Register a new tenant and store owner account.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      storeName: "",
      storeSlug: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    setLoading(false);
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Registration failed");
      return;
    }
    toast.success("Store created — signing you in");
    const sign = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (sign?.error) {
      toast.error("Account created but sign-in failed. Please log in.");
      router.push("/login");
      return;
    }
    router.push(`/admin/${values.storeSlug}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your store</CardTitle>
        <CardDescription>
          You will be the store owner. Slug is used in URLs: /store/your-slug
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-store" className="font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create store"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
