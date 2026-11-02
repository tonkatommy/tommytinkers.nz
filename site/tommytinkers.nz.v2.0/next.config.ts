import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" copies only the files the server needs into .next/standalone,
  // which keeps the production Docker image small (no full node_modules).
  output: "standalone",
  // React Compiler memoises components automatically, so we don't hand-write
  // useMemo/useCallback everywhere.
  reactCompiler: true,
  poweredByHeader: false,
};

export default nextConfig;
