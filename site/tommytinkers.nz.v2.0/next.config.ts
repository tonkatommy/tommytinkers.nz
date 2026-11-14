import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" copies only the files the server needs into .next/standalone,
  // which keeps the production Docker image small (no full node_modules).
  output: "standalone",
  // React Compiler memoises components automatically, so we don't hand-write
  // useMemo/useCallback everywhere.
  reactCompiler: true,
  // Cache Components: a page is prerendered up to its first piece of
  // request-time data. Cached reads use "use cache" (see src/server), and
  // anything live sits inside <Suspense> and streams in.
  cacheComponents: true,
  // Goes with Cache Components: links prefetch the prerendered shell of the
  // next page, so navigation feels instant.
  partialPrefetching: true,
  poweredByHeader: false,
};

export default nextConfig;
