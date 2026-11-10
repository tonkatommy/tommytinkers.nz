// `pnpm start`: runs the production build the same way Docker does.
//
// next.config.ts uses output: "standalone", which builds a self-contained
// server in .next/standalone. `next start` doesn't work with that, and the
// standalone folder doesn't include static files, so this copies them in
// (the Dockerfile does the same with COPY) and then starts the server.
//
// Written in Node rather than shell so it runs on Windows, macOS and Linux.
import { cpSync, existsSync } from "node:fs";

if (!existsSync(".next/standalone/server.js")) {
  console.error("No production build found. Run `pnpm build` first.");
  process.exit(1);
}

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
cpSync("public", ".next/standalone/public", { recursive: true });

// The standalone server listens on $HOSTNAME. Inside a container Docker sets
// that to the container's id, so it's always set explicitly here.
// START_HOST=0.0.0.0 makes it reachable from outside a container.
process.env.HOSTNAME = process.env.START_HOST ?? "localhost";
process.env.PORT ??= "3000";

await import("../.next/standalone/server.js");
