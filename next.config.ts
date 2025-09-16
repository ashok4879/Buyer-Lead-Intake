import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    // 👇 ensures Next.js uses this folder as the root
    root: __dirname,
  },
}

export default nextConfig
