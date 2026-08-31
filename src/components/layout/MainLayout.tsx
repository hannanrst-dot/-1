"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
          <Header />
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Navbar />
            <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-x-hidden">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
