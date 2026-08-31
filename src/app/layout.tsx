import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header, TopBanner } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/providers/CartProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "آیفون تصویری", "خرید آیفون تصویری", "دربازکن", "پنل ورودی", "قفل برقی",
    "جک درب پارکینگ", "دوربین مداربسته", "سیماران", "تابا", "کوماکس", "الکتروپیک",
  ],
};

export const viewport: Viewport = {
  themeColor: "#c11039",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen">
        <ToastProvider>
          <CartProvider>
            <TopBanner />
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
