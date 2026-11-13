// Gives one account the "owner" role (every permission).
//
// There is no screen for this on purpose: the first admin can't be made from
// inside the site, and nobody should be able to make themselves one. Sign up
// on the site first, confirm your email, then run this against that database:
//
//   docker compose -f deploy/compose.yaml run --rm migrate \
//     node --import tsx prisma/promote-owner.ts you@example.co.nz
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node --import tsx prisma/promote-owner.ts <email>");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(address: string) {
  const owner = await db.role.findUnique({ where: { name: "owner" } });
  if (!owner) throw new Error('No "owner" role yet. Run the seed first (prisma db seed).');

  const user = await db.user.findUnique({ where: { email: address } });
  if (!user) throw new Error("No account with that email. Sign up on the site first.");
  if (!user.emailVerified) throw new Error("That account hasn't confirmed its email yet.");

  await db.user.update({ where: { id: user.id }, data: { roleId: owner.id } });
  console.log(`Done. ${user.name} is now an owner.`);
}

main(email)
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
