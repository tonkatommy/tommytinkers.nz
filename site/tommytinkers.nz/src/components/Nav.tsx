import { auth } from "../../auth";
import { PERMISSIONS } from "@/lib/auth/permissions";
import NavClient from "./NavClient";

export default async function Nav() {
  const session = await auth();
  const perms = session?.user?.permissions ?? [];
  return <NavClient isAdmin={perms.includes(PERMISSIONS.ACCESS_ADMIN)} isAuthed={!!session?.user} />;
}
