import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Remotion's renderer/bundler depend on native Node modules (.node files).
  // Keep them external so Next.js does not try to parse native binaries as JS.
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
};

export default nextConfig;
