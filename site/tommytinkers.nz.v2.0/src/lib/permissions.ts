// Permissions are plain strings stored on a Role (Role.permissions), so a new
// one needs no migration. This list is the set the code knows about.
export const PERMISSIONS = [
  "access_admin",
  "manage_inventory",
  "manage_orders",
  "manage_discounts",
  "manage_users",
  "moderate_community",
  "manage_content",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/** True when the role's permission list includes the one asked for. */
export function hasPermission(granted: readonly string[], wanted: Permission): boolean {
  return granted.includes(wanted);
}

// The roles the seed creates. "member" has no permissions: it exists so a
// plain account has a named role in the admin users list.
export const SEED_ROLES = [
  {
    name: "owner",
    description: "Tommy. Can do everything.",
    permissions: [...PERMISSIONS],
    // System roles can't be edited or deleted in admin, so nobody can lock
    // themselves out.
    isSystem: true,
  },
  {
    name: "shopkeeper",
    description: "Runs the shop: stock, orders and discounts.",
    permissions: ["access_admin", "manage_inventory", "manage_orders", "manage_discounts"],
    isSystem: false,
  },
  {
    name: "moderator",
    description: "Looks after the Shed: the moderation queue.",
    permissions: ["access_admin", "moderate_community"],
    isSystem: false,
  },
  {
    name: "member",
    description: "A free account. Can post in the Shed and see their orders.",
    permissions: [],
    isSystem: true,
  },
] as const satisfies readonly {
  name: string;
  description: string;
  permissions: readonly Permission[];
  isSystem: boolean;
}[];
