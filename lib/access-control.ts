// PURPOSE: Centralized RBAC helpers for tenant-scoped admin, POS, and storefront APIs.

import type { Session } from "next-auth";
import type { UserRole } from "@/types";

type SessionUser = Session["user"] | null | undefined;

const STAFF_ROLES: UserRole[] = ["SUPER_ADMIN", "STORE_OWNER", "CASHIER"];
const CATALOG_MANAGER_ROLES: UserRole[] = ["SUPER_ADMIN", "STORE_OWNER"];
const ORDER_MANAGER_ROLES: UserRole[] = ["SUPER_ADMIN", "STORE_OWNER", "CASHIER"];

function hasRole(user: SessionUser, roles: UserRole[]) {
  return !!user?.role && roles.includes(user.role);
}

export function isSuperAdmin(user: SessionUser) {
  return user?.role === "SUPER_ADMIN";
}

export function isTenantMember(user: SessionUser, tenantId: string, roles: UserRole[]) {
  return hasRole(user, roles) && (isSuperAdmin(user) || user?.tenantId === tenantId);
}

export function canManageCatalog(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, CATALOG_MANAGER_ROLES);
}

export function canManageInventory(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, CATALOG_MANAGER_ROLES);
}

export function canManageOrders(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, ORDER_MANAGER_ROLES);
}

export function canReadCustomers(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, ORDER_MANAGER_ROLES);
}

export function canCreateCustomers(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, ORDER_MANAGER_ROLES);
}

export function canManageCustomers(user: SessionUser, tenantId: string) {
  return isTenantMember(user, tenantId, CATALOG_MANAGER_ROLES);
}

export function canAccessBackoffice(user: SessionUser, tenantSlug: string) {
  if (!user) return false;
  if (user.role === "CUSTOMER") return false;
  return isSuperAdmin(user) || user.tenantSlug === tenantSlug;
}

export function canReadOwnCustomerProfile(
  user: SessionUser,
  tenantId: string,
  email: string
) {
  return (
    user?.role === "CUSTOMER" &&
    user.tenantId === tenantId &&
    user.email?.toLowerCase() === email.toLowerCase()
  );
}

export function canReadOwnOrder(
  user: SessionUser,
  tenantId: string,
  customerEmail: string | undefined
) {
  return (
    user?.role === "CUSTOMER" &&
    user.tenantId === tenantId &&
    !!customerEmail &&
    user.email?.toLowerCase() === customerEmail.toLowerCase()
  );
}

export function getScopedTenantId(
  user: SessionUser,
  requestedTenantId: string | undefined,
  roles: UserRole[]
) {
  if (!user || !hasRole(user, roles)) {
    return null;
  }
  if (isSuperAdmin(user)) {
    return requestedTenantId ?? null;
  }
  return user.tenantId ?? null;
}

export function isStaffRole(role: UserRole | undefined) {
  return !!role && STAFF_ROLES.includes(role);
}
