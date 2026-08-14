"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Store, Lock, User, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = Router();
  const { login } = useAuth();

  function Router() {
    return useRouter();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user);
        router.push("/");
      } else {
        setError(data.error || "ورود ناموفق بود.");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <Store className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            ورود به سیستم فروشگاه پارس
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            مدیریت فروش و صدور فاکتور هوشمند صوتی
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              نام کاربری
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="نام کاربری"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              رمز عبور
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="رمز عبور"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? "در حال ورود..." : "ورود به نرم‌افزار"}
          </button>
        </form>

        {/* Demo Credentials Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p className="font-bold text-emerald-800 dark:text-emerald-300">اطلاعات پیش‌فرض مدیر سیستم:</p>
          <p>نام کاربری: <code className="font-bold font-mono">admin</code></p>
          <p>رمز عبور: <code className="font-bold font-mono">admin123</code></p>
        </div>

      </div>
    </div>
  );
}
