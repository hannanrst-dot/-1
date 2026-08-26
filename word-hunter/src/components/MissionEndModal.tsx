import React, { useEffect, useState } from 'react';
import { MissionResult, MissionConfig } from '../types/game';
import { fa } from '../engine/world';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, LogOut, BookOpen } from 'lucide-react';

interface Props {
  result: MissionResult;
  config: MissionConfig;
  onExit?: () => void;
}

const band = (g: number) => {
  if (g >= 18) return { t: 'عالی!', s: 'تو استاد املای این درس شدی.', c: 'emerald', e: '🏆' };
  if (g >= 15) return { t: 'خیلی خوب!', s: 'فقط چند واژه تا کامل شدن فاصله داری.', c: 'sky', e: '🎯' };
  if (g >= 12) return { t: 'خوب بود', s: 'واژه‌های پایین را یک‌بار دیگر مرور کن.', c: 'amber', e: '📚' };
  return { t: 'نیاز به تمرین', s: 'نگران نباش — قاعده‌ها را با هم مرور می‌کنیم.', c: 'rose', e: '💪' };
};

const RING: Record<string, string> = {
  emerald: 'stroke-emerald-400', sky: 'stroke-sky-400',
  amber: 'stroke-amber-400', rose: 'stroke-rose-400',
};
const TEXT: Record<string, string> = {
  emerald: 'text-emerald-300', sky: 'text-sky-300',
  amber: 'text-amber-300', rose: 'text-rose-300',
};

export const MissionEndModal: React.FC<Props> = ({ result, config, onExit }) => {
  const [tab, setTab] = useState<'summary' | 'review'>('summary');
  const b = band(result.grade20);
  const pct = Math.min(100, (result.grade20 / 20) * 100);

  useEffect(() => {
    if (result.grade20 >= 15) {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 }, ticks: 220 });
      audioService.playVictory();
    } else {
      audioService.playCoin();
    }
  }, [result.grade20]);

  const R = 62;
  const C = 2 * Math.PI * R;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex items-start sm:items-center justify-center p-4">
      <div className="w-full max-w-2xl my-auto rounded-3xl border-2 border-slate-700 bg-slate-900 shadow-2xl animate-[wh-pop_.25s_ease-out] overflow-hidden">
        {/* سربرگ با نمره */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-slate-800">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={R} className="stroke-slate-800" strokeWidth="11" fill="none" />
              <circle
                cx="70" cy="70" r={R}
                className={`${RING[b.c]} transition-[stroke-dashoffset] duration-[1200ms] ease-out`}
                strokeWidth="11" fill="none" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl">{b.e}</span>
              <span className={`text-3xl font-black ${TEXT[b.c]}`}>{fa(result.grade20)}</span>
              <span className="text-[10px] text-slate-500">از ۲۰</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className={`text-2xl font-black ${TEXT[b.c]}`}>{b.t}</h1>
            <p className="text-sm text-slate-400 mt-1">{b.s}</p>
            <p className="text-[11px] text-slate-600 mt-2">
              {config.student.name} · {config.title}
            </p>
          </div>
          {!result.completed && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-700/60 text-[11px] text-amber-200">
              {result.livesLeft <= 0 ? 'جان‌ها تمام شد' : 'زمان تمام شد'} — {fa(result.answered)} از {fa(result.questionCount)} پرسش پاسخ داده شد
            </div>
          )}
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-5">
          <Cell label="پاسخ درست" value={`${fa(result.correct)} از ${fa(result.answered)}`} tone="text-emerald-300" />
          <Cell label="دقت" value={`${fa(Math.round(result.accuracy * 100))}٪`} tone={TEXT[b.c]} />
          <Cell label="بهترین زنجیره" value={`×${fa(result.bestStreak)}`} tone="text-orange-300" />
          <Cell label="زمان" value={humanDuration(result.durationSec)} tone="text-sky-300" />
        </div>

        {/* زبانه‌ها */}
        {result.missed.length > 0 && (
          <div className="px-5">
            <div className="flex gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              {(['summary', 'review'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                    tab === t ? 'bg-slate-800 text-amber-300' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'summary' ? 'همهٔ پاسخ‌ها' : `واژه‌های اشتباه (${fa(result.missed.length)})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* فهرست */}
        <div className="p-5 pt-3 max-h-64 overflow-y-auto flex flex-col gap-2">
          {tab === 'review' ? (
            result.missed.map((m) => (
              <div key={m.wordId} className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/60">
                <span className="text-lg font-black text-emerald-300">{m.correctSpelling}</span>
                {m.rule && <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">{m.rule}</p>}
              </div>
            ))
          ) : (
            result.answers.map((a) => (
              <div
                key={a.index}
                className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                  a.correct ? 'bg-emerald-950/25 border-emerald-900/60' : 'bg-rose-950/25 border-rose-900/60'
                }`}
              >
                {a.correct
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span className="text-xs text-slate-500 w-6 shrink-0">{fa(a.index + 1)}</span>
                <span className="text-sm font-bold text-slate-100 flex-1 truncate">{a.word}</span>
                {!a.correct && a.chosen && (
                  <span className="text-xs text-rose-400/90 line-through shrink-0">{a.chosen}</span>
                )}
                <span className="text-[10px] text-slate-600 shrink-0">
                  {spellingContentAdapter.getCategoryInfo(a.category).short}
                </span>
                <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">
                  {fa((a.ms / 1000).toFixed(1))} ثانیه
                </span>
              </div>
            ))
          )}
        </div>

        {/* پایان */}
        <div className="p-5 pt-0 flex flex-col sm:flex-row gap-2.5">
          {result.missed.length > 0 && tab === 'summary' && (
            <button
              onClick={() => setTab('review')}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> مرور واژه‌های اشتباه
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> بازگشت به کلاس
            </button>
          )}
        </div>

        <p className="pb-5 text-center text-[10px] text-slate-600">
          نتیجه برای معلم ثبت شد.
        </p>
      </div>
    </div>
  );
};

function humanDuration(sec: number): string {
  if (sec < 60) return `${fa(sec)} ثانیه`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${fa(m)} دقیقه` : `${fa(m)}:${fa(String(s).padStart(2, '0'))} دقیقه`;
}

const Cell: React.FC<{ label: string; value: string; tone: string }> = ({ label, value, tone }) => (
  <div className="flex flex-col items-center gap-0.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
    <span className="text-[10px] text-slate-500">{label}</span>
    <span className={`text-sm font-black ${tone}`}>{value}</span>
  </div>
);
