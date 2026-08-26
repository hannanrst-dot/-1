import React, { useEffect } from 'react';
import { LevelConfig, LevelResult } from '../types/game';
import { Modal, Stat } from './Modal';
import { fa } from '../engine/world';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { Star, RotateCcw, ArrowLeft, Map, BarChart3 } from 'lucide-react';

interface Props {
  result: LevelResult;
  level: LevelConfig;
  bestCombo: number;
  hasNext: boolean;
  projector: boolean;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
  onOpenReport: () => void;
}

const STAR_MSG = [
  'این بار نشد؛ اما هر تیر خطا هم یک درس است. دوباره تلاش کن!',
  'مرحله را رد کردی! با دقت بیشتر می‌توانی ستاره‌های بیشتری بگیری.',
  'عالی بود! فقط چند خطای کوچک تا کمال فاصله داری.',
  'بی‌نقص! تو استاد املای این سرزمین شدی. 👑',
];

export const LevelEndModal: React.FC<Props> = ({
  result, level, bestCombo, hasNext, projector, onNext, onRetry, onMap, onOpenReport,
}) => {
  const win = result.victory;
  const acc = Math.round(result.accuracy * 100);
  const info = spellingContentAdapter.getGameModeDisplayName(level.mode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { win && hasNext ? onNext() : onRetry(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [win, hasNext, onNext, onRetry]);

  return (
    <Modal
      isOpen
      title={win ? 'پیروزی در میدان!' : 'کمانت شکست…'}
      subtitle={`${level.title} — ${info.fa}`}
      icon={win ? '🏆' : '💔'}
      accent={win ? 'amber' : 'rose'}
      size="md"
      projector={projector}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {win && hasNext && (
            <button
              onClick={onNext}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              مرحلهٔ بعد <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onRetry}
            className={`py-3.5 px-5 rounded-2xl font-bold text-sm border transition active:scale-95 flex items-center justify-center gap-2 ${
              !win
                ? 'flex-1 bg-gradient-to-l from-rose-500 to-orange-400 text-slate-950 border-rose-300 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> {win ? 'تکرار' : 'تلاش دوباره'}
          </button>
          <button
            onClick={onOpenReport}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> گزارش کلاس
          </button>
          <button
            onClick={onMap}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4" /> نقشه
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        {/* ستاره‌ها */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{ animationDelay: `${s * 140}ms` }}
              className={`p-3 rounded-2xl border-2 transition-all ${
                s <= result.stars
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/30 scale-110 animate-[wh-pop_.4s_backwards]'
                  : 'bg-slate-800/40 border-slate-700 opacity-40 scale-90'
              }`}
            >
              <Star className={`${projector ? 'w-12 h-12' : 'w-9 h-9'} ${s <= result.stars ? 'text-yellow-300 fill-yellow-300' : 'text-slate-600'}`} />
            </div>
          ))}
        </div>

        <p className={`text-slate-300 leading-relaxed max-w-md ${projector ? 'text-base' : 'text-sm'}`}>
          {STAR_MSG[result.stars]}
        </p>

        {/* آمار */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 w-full">
          <Stat label="امتیاز مرحله" value={fa(result.score)} icon="✨" tone="text-emerald-300" />
          <Stat label="دقت پاسخ" value={`${fa(acc)}٪`} icon="🎯" tone={acc >= 80 ? 'text-emerald-300' : acc >= 60 ? 'text-amber-300' : 'text-rose-300'} />
          <Stat label="بیشترین کمبو" value={`×${fa(bestCombo)}`} icon="🔥" tone="text-orange-300" />
          <Stat label="دورهای درست" value={fa(result.rounds)} icon="📚" tone="text-sky-300" />
          <Stat label="سکهٔ دریافتی" value={fa(result.coins + result.stars * 40)} icon="🪙" tone="text-yellow-300" />
        </div>

        {result.stars < 3 && win && (
          <div className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-amber-300 font-bold">برای سه ستاره: </span>
              دقت پاسخ باید دست‌کم ۹۰٪ باشد. اگر واژه‌ای را اشتباه زدی، در «راهنمای املا» قاعده‌اش را دوباره بخوان و مرحله را تکرار کن.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
