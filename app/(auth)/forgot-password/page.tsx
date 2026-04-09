// PURPOSE: Password reset request form (UI only — wire to email provider in production).

"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    toast.success(`If an account exists for ${values.email}, you will receive a link.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email. In production, Nexus sends a secure reset link.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <Button variant="link" asChild>
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
