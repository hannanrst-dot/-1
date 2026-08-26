import React, { useState, useRef, useEffect } from 'react';
import { ClassSessionState } from '../types/game';
import { fa } from '../engine/world';
import {
  GraduationCap, Users, BarChart3, BookOpen, Library, Music, Music2, RotateCcw, ChevronDown,
} from 'lucide-react';

interface Props {
  session: ClassSessionState;
  musicOn: boolean;
  onOpenSession: () => void;
  onOpenReport: () => void;
  onOpenTeacherWords: () => void;
  onOpenGuide: () => void;
  onToggleMusic: () => void;
  onResetProgress: () => void;
}

/**
 * همهٔ ابزارهای معلم زیر یک دکمه.
 *
 * پیش‌تر هشت دکمه در نوار بالا بود و پیدا کردن هرکدام وقت می‌برد. حالا فقط
 * چیزهایی بیرون می‌مانند که معلم وسط کلاس مدام به آن‌ها دست می‌زند
 * (پروژکتور و صدا)، و بقیه اینجا با توضیح یک‌خطی جمع شده‌اند.
 */
export const TeacherMenu: React.FC<Props> = ({
  session, musicOn,
  onOpenSession, onOpenReport, onOpenTeacherWords, onOpenGuide, onToggleMusic, onResetProgress,
}) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const go = (fn: () => void) => () => { setOpen(false); fn(); };

  const hasRoster = session.roster.length > 0;
  const answered = session.totalAttempts;

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border shadow-md transition active:scale-95 ${
          open
            ? 'bg-teal-400 text-slate-950 border-teal-300'
            : 'bg-teal-600/90 hover:bg-teal-500 text-white border-teal-400/50'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>ابزار معلم</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl z-50 overflow-hidden animate-[wh-pop_.15s_ease-out]">
          {hasRoster && (
            <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800">
              <div className="text-xs font-black text-teal-300">{session.className}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {fa(session.roster.length)} دانش‌آموز
                {answered > 0 && <> · {fa(answered)} پاسخ ثبت شده</>}
              </div>
            </div>
          )}

          <Item
            icon={<Users className="w-4 h-4 text-teal-400" />}
            title={hasRoster ? 'فهرست کلاس و نوبت‌ها' : 'ساختن فهرست کلاس'}
            hint={hasRoster ? 'ویرایش اسامی، حالت نوبتی' : 'یک‌بار اسم‌ها را وارد کن، بازی بقیه را نگه می‌دارد'}
            onClick={go(onOpenSession)}
          />
          <Item
            icon={<BarChart3 className="w-4 h-4 text-indigo-400" />}
            title="کارنامهٔ کلاس"
            hint="نمرهٔ هر نفر و واژه‌هایی که کلاس اشتباه کرد"
            onClick={go(onOpenReport)}
            badge={answered > 0 ? fa(answered) : undefined}
          />
          <Item
            icon={<BookOpen className="w-4 h-4 text-violet-400" />}
            title="واژه‌های درس من"
            hint="واژه‌های همین هفته را به بازی اضافه کن"
            onClick={go(onOpenTeacherWords)}
          />
          <Item
            icon={<Library className="w-4 h-4 text-amber-400" />}
            title="دانشنامهٔ املا"
            hint="۱۴۱ واژه با قاعده و نمونه در جمله"
            onClick={go(onOpenGuide)}
          />

          <div className="border-t border-slate-800" />

          <Item
            icon={musicOn ? <Music className="w-4 h-4 text-sky-400" /> : <Music2 className="w-4 h-4 text-slate-600" />}
            title={musicOn ? 'موسیقی زمینه: روشن' : 'موسیقی زمینه: خاموش'}
            hint="جلوه‌های صوتی جدا از این تنظیم‌اند"
            onClick={() => onToggleMusic()}
          />
          <Item
            icon={<RotateCcw className="w-4 h-4 text-rose-400" />}
            title="بازنشانی پیشرفت"
            hint="ستاره‌ها، سکه‌ها و مرحله‌های باز شده پاک می‌شوند"
            onClick={go(onResetProgress)}
            danger
          />
        </div>
      )}
    </div>
  );
};

const Item: React.FC<{
  icon: React.ReactNode; title: string; hint: string;
  onClick: () => void; badge?: string; danger?: boolean;
}> = ({ icon, title, hint, onClick, badge, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-start gap-3 px-4 py-3 text-right transition ${
      danger ? 'hover:bg-rose-950/40' : 'hover:bg-slate-800'
    }`}
  >
    <span className="mt-0.5 shrink-0">{icon}</span>
    <span className="flex-1 min-w-0">
      <span className={`block text-xs font-bold ${danger ? 'text-rose-300' : 'text-slate-100'}`}>{title}</span>
      <span className="block text-[10px] text-slate-500 leading-relaxed mt-0.5">{hint}</span>
    </span>
    {badge && (
      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black">
        {badge}
      </span>
    )}
  </button>
);
