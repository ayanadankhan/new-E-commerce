// PURPOSE: Detect tenant slug from path or subdomain and protect admin, POS, and checkout routes.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecretForJwt } from "@/lib/auth-secret";
import { canAccessBackoffice } from "@/lib/access-control";

function extractSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/(store|admin|pos)\/([^/]+)/);
  return m?.[2] ?? null;
}

function extractSlugFromHost(host: string): string | null {
  const hostOnly = host.split(":")[0]?.toLowerCase() ?? "";
  const parts = hostOnly.split(".");
  if (parts.length < 2) return null;
  const sub = parts[0];
  if (!sub || sub === "www") return null;
  if (hostOnly.includes("localhost")) {
    return parts.length >= 2 ? sub : null;
  }
  return sub;
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const pathSlug = extractSlugFromPath(pathname);
  const hostSlug = extractSlugFromHost(req.headers.get("host") ?? "");
  const slug = pathSlug ?? hostSlug;

  const requestHeaders = new Headers(req.headers);
  if (slug) {
    requestHeaders.set("x-tenant-slug", slug);
  }

  const secret = authSecretForJwt();
  const token =
    secret.length > 0
      ? await getToken({
          req,
          secret,
          secureCookie: process.env.NODE_ENV === "production",
        })
      : null;

  const role = token?.role as string | undefined;
  const isLoggedIn = !!token?.email;

  if (pathname.startsWith("/admin") || pathname.startsWith("/pos")) {
    if (!isLoggedIn) {
      const login = new URL("/login", nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    if (
      slug &&
      !canAccessBackoffice(
        {
          id: typeof token?.uid === "string" ? token.uid : "",
          email: typeof token?.email === "string" ? token.email : "",
          name: typeof token?.name === "string" ? token.name : "",
          role: role as
            | "SUPER_ADMIN"
            | "STORE_OWNER"
            | "CASHIER"
            | "CUSTOMER",
          tenantId:
            typeof token?.tenantId === "string" ? token.tenantId : undefined,
          tenantSlug:
            typeof token?.tenantSlug === "string" ? token.tenantSlug : undefined,
        },
        slug
      )
    ) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  const checkoutMatch = pathname.match(/^\/store\/[^/]+\/checkout/);
  if (checkoutMatch) {
    if (!isLoggedIn || role !== "CUSTOMER") {
      const slugFromPath = pathname.split("/")[2];
      const loginUrl = new URL(`/store/${slugFromPath}/login`, nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (pathname.startsWith("/admin") || pathname.startsWith("/pos")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
