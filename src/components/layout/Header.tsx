"use client";

import React, { useState } from "react";
import { Mic, Moon, Sun, Store, User, LogOut, Sparkles, HelpCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { VoiceAssistantModal } from "../voice/VoiceAssistantModal";
import { SafeBoundary } from "../common/SafeBoundary";
import { IranianDeployGuideModal } from "../deploy/IranianDeployGuideModal";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
                نوشت‌افزار حنان
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                سیستم فروشگاهی و مدیریت صوتی
              </p>
            </div>
          </div>

          {/* Center Prominent Voice Mic Button ("با صدا انجام بده") */}
          <div className="flex items-center">
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 border border-white/20"
            >
              <Mic className="w-4 h-4 animate-pulse text-emerald-200" />
              <span>🎙️ با صدا انجام بده</span>
            </button>
          </div>

          {/* Right Actions: Dark Mode, Deployment Guide, User Info */}
          <div className="flex items-center gap-2">
            
            {/* Deploy Guide Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              title="راهنمای هاست ایرانی"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">هاست ایرانی</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              aria-label="تغییر تم"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Badge & Logout */}
            {user ? (
              <div className="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{user.fullName}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {user.role === "admin" ? "مدیر کل" : "فروشنده"}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="خروج از حساب"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

          </div>

        </div>
      </header>

      <SafeBoundary label="دستیار صوتی">
        <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      </SafeBoundary>
      <IranianDeployGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}
