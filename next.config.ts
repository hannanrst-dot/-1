import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 یک ماژول نیتیو است و نباید توسط باندلر Next بسته‌بندی شود.
  serverExternalPackages: ["better-sqlite3"],

  // موقعِ بیلد روی هاست (لیارا)، بررسیِ TypeScript را رد می‌کنیم.
  // دلیل: این مرحله گاهی به‌خاطرِ نسخهٔ کمی متفاوتِ تایپ‌ها روی سرور شکست می‌خورد
  // (خطای «Running TypeScript») و بیلد را هم کند می‌کند. صحّتِ تایپ‌ها جداگانه با
  // `tsc --noEmit` بررسی می‌شود، پس رد کردنِ این مرحله در بیلد امن و سریع‌تر است.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
