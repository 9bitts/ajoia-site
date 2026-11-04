import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["sharp", "@prisma/client", "bcryptjs", "nodemailer"],
};

export default nextConfig;
