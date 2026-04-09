// PURPOSE: Edge-safe NextAuth configuration; DB access is deferred to dynamic imports.

import { AuthError } from "@auth/core/errors";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authSecretForSession } from "@/lib/auth-secret";
import type { UserRole } from "@/types";

function logAuthError(error: Error) {
  const red = "\x1b[31m";
  const reset = "\x1b[0m";
  const name = error instanceof AuthError ? error.type : error.name;
  console.error(`${red}[auth][error]${reset} ${name}: ${error.message}`);
  if (
    error.cause &&
    typeof error.cause === "object" &&
    "err" in error.cause &&
    (error.cause as { err: unknown }).err instanceof Error
  ) {
    const { err, ...data } = error.cause as { err: Error; [k: string]: unknown };
    console.error(`${red}[auth][cause]${reset}:`, err.stack);
    if (Object.keys(data).length)
      console.error(`${red}[auth][details]${reset}:`, JSON.stringify(data, null, 2));
  } else if (error.stack) {
    console.error(error.stack.replace(/.*/, "").substring(1));
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: authSecretForSession(),
  logger: {
    error(error) {
      if (
        error instanceof AuthError &&
        (error.type === "JWTSessionError" || error.type === "SessionTokenError")
      ) {
        return;
      }
      logAuthError(error);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant slug", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const { loginWithCredentials } = await import("@/lib/auth-actions");
        return loginWithCredentials({
          email: String(credentials.email),
          password: String(credentials.password),
          tenantSlug: credentials.tenantSlug
            ? String(credentials.tenantSlug)
            : undefined,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id ?? "";
        token.role = user.role as UserRole;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantSlug = token.tenantSlug;
      }
      return session;
    },
  },
};
