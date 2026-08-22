import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { InstallApp } from "@/components/pwa/InstallApp";

export const metadata: Metadata = {
  title: "نوشت‌افزار حنان",
  description: "سیستم کامل فروشگاهی، صدور فاکتور، مدیریت کالا و انبار با دستیار صوتی هوشمند فارسی — نوشت‌افزار حنان",
  manifest: "/manifest.webmanifest",
  applicationName: "نوشت‌افزار حنان",
  appleWebApp: { capable: true, title: "حنان", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
