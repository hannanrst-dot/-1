import React from 'react';
import { fa } from '../engine/world';
import { Play, GraduationCap } from 'lucide-react';

interface Props {
  levelCount: number;
  wordCount: number;
  onStart: () => void;
  onTeacher: () => void;
}

const FLOATING = [
  { w: 'مدرسه', x: 8, y: 18, d: 0 },
  { w: 'صابون', x: 78, y: 12, d: 1.4 },
  { w: 'گذشته', x: 16, y: 72, d: 2.2 },
  { w: 'خواهر', x: 84, y: 66, d: 0.8 },
  { w: 'طوطی', x: 46, y: 84, d: 3.1 },
  { w: 'حیاط', x: 68, y: 38, d: 1.9 },
  { w: 'ثروت', x: 26, y: 44, d: 2.7 },
];

/**
 * صفحهٔ خوش‌آمد — فقط بار نخست دیده می‌شود.
 * هدفش این است که معلم یا دانش‌آموز در سه خط بفهمد اینجا چه خبر است،
 * بعد با یک کلیک وارد بازی شود.
 */
export const TitleScreen: React.FC<Props> = ({ levelCount, wordCount, onStart, onTeacher }) => (
  <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center p-6">
    {/* پس‌زمینه */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 25%, #1e3a5f 0%, #0b1220 55%, #05070f 100%)' }}
    />
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.08]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 65%, #fff 1px, transparent 1px)',
        backgroundSize: '110px 110px, 80px 80px',
      }}
    />

    {/* واژه‌های شناور */}
    {FLOATING.map((f) => (
      <span
        key={f.w}
        className="absolute hidden sm:block px-3 py-1.5 rounded-xl border border-sky-400/25 bg-slate-900/50 text-sky-200/70 text-sm font-bold backdrop-blur-sm animate-float pointer-events-none"
        style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${f.d}s` }}
      >
        {f.w}
      </span>
    ))}

    {/* کارت اصلی */}
    <div className="relative z-10 w-full max-w-lg text-center flex flex-col items-center gap-6 animate-[wh-pop_.4s_ease-out]">
      <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 animate-glow">
        🏹
      </div>

      <div>
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-l from-amber-300 via-yellow-100 to-amber-400 bg-clip-text text-transparent leading-tight">
          شکارچی کلمات
        </h1>
        <p className="mt-2 text-sm text-slate-400">بازی اکشن آموزش املای فارسی</p>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed max-w-md">
        با کمان به واژه‌ها شلیک کن و املای درست را پیدا کن.
        بعد از هر پاسخ، می‌فهمی <span className="text-amber-300 font-bold">چرا</span> آن واژه این‌طور نوشته می‌شود.
      </p>

      <div className="flex items-center gap-2.5 text-xs text-slate-400">
        <Pill>{fa(levelCount)} مرحله</Pill>
        <Pill>{fa(10)} حالت بازی</Pill>
        <Pill>{fa(wordCount)} واژه</Pill>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black text-lg shadow-2xl shadow-amber-500/30 transition active:scale-95 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-current" /> شروع بازی
      </button>

      <button
        onClick={onTeacher}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
      >
        <GraduationCap className="w-4 h-4 text-teal-400" /> معلم هستم — فهرست کلاسم را بسازم
      </button>

      <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm">
        همهٔ اطلاعات روی همین دستگاه می‌ماند. نه ثبت‌نامی لازم است، نه اینترنتی.
      </p>
    </div>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 font-bold">{children}</span>
);
