import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.18', 'localhost', '127.0.0.1'],
};

export default nextConfig;
