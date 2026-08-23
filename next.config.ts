import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./prisma/demo-seed.db"],
  },
};

export default nextConfig;
