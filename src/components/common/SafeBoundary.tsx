"use client";

import React from "react";

/**
 * حصارِ خطا: اگر در بخشی از برنامه خطای غیرمنتظره‌ای رخ دهد، به‌جای اینکه کلِ صفحه
 * سفید/بسته شود، فقط همان بخش با یک پیامِ فارسی جایگزین می‌شود و بقیهٔ برنامه سالم
 * می‌ماند. مخصوصاً برای بخشِ صوتی که به میکروفون و سرویس‌های بیرونی وابسته است.
 */
interface Props { children: React.ReactNode; onClose?: () => void; label?: string }
interface State { failed: boolean; message: string }

export class SafeBoundary extends React.Component<Props, State> {
  state: State = { failed: false, message: "" };

  static getDerivedStateFromError(error: any): State {
    return { failed: true, message: String(error?.message || error || "") };
  }

  componentDidCatch(error: any, info: any) {
    console.error("SafeBoundary caught:", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full space-y-3 text-center shadow-2xl">
          <div className="text-4xl">⚠️</div>
          <div className="font-bold text-gray-900 dark:text-white">
            {this.props.label || "این بخش"} با مشکل روبه‌رو شد
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            بقیهٔ برنامه سالم است. این پنجره را ببندید و دوباره امتحان کنید؛
            یا از «سرچ و انتخاب» و «بارکد» استفاده کنید.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { this.setState({ failed: false, message: "" }); this.props.onClose?.(); }}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    );
  }
}
