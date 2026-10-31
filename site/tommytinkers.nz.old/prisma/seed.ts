import { prisma } from "../src/lib/prisma";
import { DEFAULT_ROLES } from "../src/lib/auth/permissions";

async function main() {
  for (const role of Object.values(DEFAULT_ROLES)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: role,
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
