// PURPOSE: Customer sign-in for a specific storefront (passes tenant slug to credentials).

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";
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

type FormValues = z.infer<typeof loginSchema>;

export default function StoreCustomerLoginPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? `/store/${slug}/account`;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      tenantSlug: slug,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid credentials for this store");
      return;
    }
    toast.success("Welcome back");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Customer sign in</CardTitle>
        <CardDescription>Use your customer account for {slug}.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
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
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Continue"}
            </Button>
            <Button variant="link" asChild>
              <Link href={`/store/${slug}`}>Back to store</Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
