// PURPOSE: NextAuth.js v5 app exports; combines edge-safe config with Node route handlers.

import NextAuth from "next-auth";
import type { Session } from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** Like `auth()`, but never throws when the session JWT is invalid (wrong secret, corrupt cookie). */
export async function authSafe(): Promise<Session | null> {
  try {
    const s = await auth();
    return s ?? null;
  } catch {
    return null;
  }
}
