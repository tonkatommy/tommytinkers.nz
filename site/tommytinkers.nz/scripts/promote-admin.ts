import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2] ?? process.env.INITIAL_ADMIN_EMAIL;
  if (!email) {
    throw new Error("Usage: tsx scripts/promote-admin.ts <email>");
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
  const user = await prisma.user.update({ where: { email }, data: { roleId: adminRole.id } });
  console.log(`Promoted ${user.email} to ADMIN`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
