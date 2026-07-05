export const PERMISSIONS = {
  ACCESS_ADMIN: "access_admin",
  MANAGE_INVENTORY: "manage_inventory",
  MANAGE_ORDERS: "manage_orders",
  MANAGE_USERS: "manage_users",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLES = {
  ADMIN: { name: "ADMIN", permissions: Object.values(PERMISSIONS) as string[] },
  USER: { name: "USER", permissions: [] as string[] },
};
