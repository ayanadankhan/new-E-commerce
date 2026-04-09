// UI: Client wrapper that provides NextAuth session context to client components.

"use client";

import * as React from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
  );
}
