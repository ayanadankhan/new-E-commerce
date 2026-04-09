// PURPOSE: Single source for JWT/session signing so middleware and Auth.js never disagree.

const DEV_FALLBACK =
  "development-only-secret-min-32-chars-for-local-default";

function fromEnv(): string | undefined {
  const a = process.env.AUTH_SECRET?.trim();
  if (a) return a;
  const n = process.env.NEXTAUTH_SECRET?.trim();
  if (n) return n;
  return undefined;
}

/** Secret for Auth.js `secret` option (undefined in production if unset). */
export function authSecretForSession(): string | undefined {
  const s = fromEnv();
  if (s) return s;
  if (process.env.NODE_ENV === "production") return undefined;
  return DEV_FALLBACK;
}

/** Secret for `getToken` in middleware (empty string if production and unset). */
export function authSecretForJwt(): string {
  const s = fromEnv();
  if (s) return s;
  if (process.env.NODE_ENV === "production") return "";
  return DEV_FALLBACK;
}
