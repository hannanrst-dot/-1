import React, { useState, useRef, useEffect } from 'react';
import { ClassSessionState } from '../types/game';
import { Modal } from './Modal';
import { classSession } from '../services/ClassSession';
import { audioService } from '../services/AudioService';
import { fa } from '../engine/world';
import confetti from 'canvas-confetti';
import { RefreshCw, SkipForward, Settings2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  session: ClassSessionState;
  projector: boolean;
  onClose: () => void;
  onOpenSession: () => void;
}

export const StudentPickerModal: React.FC<Props> = ({ isOpen, session, projector, onClose, onOpenSession }) => {
  const [spinning, setSpinning] = useState(false);
  const [shown, setShown] = useState<string | null>(session.currentStudent);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  useEffect(() => { if (isOpen) setShown(session.currentStudent); }, [isOpen, session.currentStudent]);

  const roster = session.roster;

  const spin = () => {
    if (spinning || roster.length === 0) return;
    setSpinning(true);
    audioService.playUiClick();
    let n = 0;
    const total = 18 + Math.floor(Math.random() * 10);
    timer.current = window.setInterval(() => {
      setShown(roster[Math.floor(Math.random() * roster.length)]);
      n++;
      if (n >= total) {
        if (timer.current) window.clearInterval(timer.current);
        const winner = classSession.randomStudent();
        setShown(winner);
        if (winner) classSession.setCurrentStudent(winner);
        setSpinning(false);
        audioService.playComboFanfare();
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.5 } });
      }
    }, 85);
  };

  const rec = shown ? session.students[shown] : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="نوبت دانش‌آموز"
      subtitle="انتخاب تصادفی و عادلانه — کسانی که کمتر نوبت گرفته‌اند شانس بیشتری دارند."
      icon="🎯"
      accent="teal"
      size="sm"
      projector={projector}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95"
        >
          بازگشت به بازی
        </button>
      }
    >
      {roster.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center gap-3">
          <div className="text-5xl">🧑‍🏫</div>
          <p className="text-sm text-slate-300 font-bold">هنوز فهرست کلاس را وارد نکرده‌ای.</p>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            اسامی دانش‌آموزان یا گروه‌ها را یک‌بار وارد کن؛ از آن پس بازی نوبت‌ها و آمار هر نفر را نگه می‌دارد.
          </p>
          <button
            onClick={onOpenSession}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition active:scale-95"
          >
            <Settings2 className="w-4 h-4" /> تنظیم فهرست کلاس
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden p-7 rounded-2xl bg-gradient-to-b from-slate-950 to-teal-950/40 border border-teal-500/40 flex flex-col items-center justify-center text-center min-h-[170px]">
            <span className="text-[11px] text-teal-400 font-black mb-2">نوبت پرتاب تیر با</span>
            {shown ? (
              <div className={`font-black text-amber-300 transition-transform duration-100 ${spinning ? 'scale-105 opacity-70 blur-[0.4px]' : 'scale-100'} ${projector ? 'text-4xl' : 'text-3xl'}`}>
                🏹 {shown}
              </div>
            ) : (
              <div className="text-sm text-slate-500">گردونه را بچرخان…</div>
            )}
            {rec && rec.attempts > 0 && !spinning && (
              <div className="mt-2 text-[11px] text-slate-400">
                تاکنون {fa(rec.correct)} پاسخ درست از {fa(rec.attempts)} تلاش
                {rec.bestStreak > 1 && <> · بهترین زنجیره ×{fa(rec.bestStreak)}</>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={spin}
              disabled={spinning}
              className="py-3 rounded-2xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'در حال چرخش…' : 'چرخاندن گردونه'}
            </button>
            <button
              onClick={() => { const n = classSession.nextTurn(); setShown(n); audioService.playUiClick(); }}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4" /> نفر بعدی فهرست
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400">
                انتخاب دستی ({fa(roster.length)} نفر)
              </span>
              <button onClick={onOpenSession} className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1">
                <Settings2 className="w-3 h-3" /> ویرایش فهرست
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              {roster.map((n) => (
                <button
                  key={n}
                  onClick={() => { classSession.setCurrentStudent(n); setShown(n); }}
                  className={`px-2.5 py-1 rounded-xl text-xs border transition ${
                    session.currentStudent === n
                      ? 'bg-teal-500 text-slate-950 border-teal-300 font-black'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500/60'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {session.turnMode === 'free' && (
            <button
              onClick={() => classSession.setTurnMode('turns')}
              className="w-full py-2.5 rounded-xl bg-teal-950/60 border border-teal-700/60 text-teal-200 text-[11px] font-bold hover:bg-teal-900/60 transition"
            >
              فعال کردن حالت نوبتی — بعد از هر پاسخ، نوبت خودکار به نفر بعد می‌رسد
            </button>
          )}
        </div>
      )}
    </Modal>
  );
};
