import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 یک ماژول نیتیو است و نباید توسط باندلر Next بسته‌بندی شود.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
