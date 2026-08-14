import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "نرم‌افزار فروشگاهی و مدیریت فاکتور صوتی پارس",
  description: "سیستم کامل فروشگاهی، صدور فاکتور، مدیریت کالا و انبار با دستیار صوتی هوشمند فارسی",
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
      </body>
    </html>
  );
}
