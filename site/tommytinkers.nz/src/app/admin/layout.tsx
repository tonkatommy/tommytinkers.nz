import { requirePermission } from "@/lib/auth/require-permission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePermission(PERMISSIONS.ACCESS_ADMIN);
  return <>{children}</>;
}
