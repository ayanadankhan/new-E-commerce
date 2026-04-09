// PURPOSE: Augment next-auth Session and JWT types with Nexus Commerce user fields.

import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      tenantId?: string;
      tenantSlug?: string;
    };
  }

  interface User {
    role: UserRole;
    tenantId?: string;
    tenantSlug?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
    tenantId?: string;
    tenantSlug?: string;
  }
}
