import React, { useMemo } from 'react';
import { ClassSessionState } from '../types/game';
import { Modal, Stat } from './Modal';
import { classSession } from '../services/ClassSession';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { fa } from '../engine/world';
import { Printer, Trash2, Medal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  session: ClassSessionState;
  onClose: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export const ClassReportModal: React.FC<Props> = ({ isOpen, session, onClose }) => {
  const board = useMemo(() => (isOpen ? classSession.leaderboard() : []), [isOpen, session]);
  const missed = useMemo(() => (isOpen ? classSession.topMissed(10) : []), [isOpen, session]);
  const acc = session.totalAttempts ? session.totalCorrect / session.totalAttempts : 0;

  const missedWords = missed
    .map((m) => ({ item: spellingContentAdapter.getItemById(m.id), count: m.count }))
    .filter((m) => m.item);

  const print = () => window.print();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="گزارش جلسهٔ کلاس"
      subtitle={`${session.className}${session.teacherName ? ` — آموزگار: ${session.teacherName}` : ''}`}
      icon="📊"
      accent="indigo"
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={print}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> چاپ یا ذخیرهٔ PDF
          </button>
          <button
            onClick={() => {
              if (window.confirm('آمار این جلسه پاک شود؟ فهرست اسامی باقی می‌ماند.')) classSession.resetStats();
            }}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> جلسهٔ تازه
          </button>
        </div>
      }
    >
      <div id="wh-report" className="flex flex-col gap-5">
        {session.totalAttempts === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-3">🗒️</div>
            <p className="text-slate-300 font-bold">هنوز پاسخی ثبت نشده است.</p>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              پس از اینکه دانش‌آموزان چند واژه را بزنند، اینجا می‌بینی چه کسی چند پاسخ درست داده
              و کلاس روی کدام واژه‌ها بیشتر اشتباه کرده است.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Stat label="کل پاسخ‌ها" value={fa(session.totalAttempts)} icon="🎯" />
              <Stat label="پاسخ درست" value={fa(session.totalCorrect)} icon="✅" tone="text-emerald-300" />
              <Stat
                label="دقت کلاس"
                value={`${fa(Math.round(acc * 100))}٪`}
                icon="📈"
                tone={acc >= 0.8 ? 'text-emerald-300' : acc >= 0.6 ? 'text-amber-300' : 'text-rose-300'}
              />
              <Stat label="شرکت‌کننده" value={fa(board.length)} icon="🧑‍🎓" tone="text-sky-300" />
            </div>

            {/* جدول دانش‌آموزان */}
            {board.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-100 mb-2.5">
                  <Medal className="w-4 h-4 text-amber-400" /> کارنامهٔ دانش‌آموزان
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5 font-bold">#</th>
                        <th className="px-3 py-2.5 font-bold">نام</th>
                        <th className="px-3 py-2.5 font-bold">پاسخ درست</th>
                        <th className="px-3 py-2.5 font-bold">دقت</th>
                        <th className="px-3 py-2.5 font-bold">بهترین زنجیره</th>
                        <th className="px-3 py-2.5 font-bold">امتیاز</th>
                      </tr>
                    </thead>
                    <tbody>
                      {board.map((r, i) => {
                        const a = r.attempts ? r.correct / r.attempts : 0;
                        return (
                          <tr key={r.name} className={i % 2 ? 'bg-slate-900/40' : 'bg-slate-900/10'}>
                            <td className="px-3 py-2.5 text-slate-500">{MEDALS[i] || fa(i + 1)}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-100">{r.name}</td>
                            <td className="px-3 py-2.5 text-slate-300">{fa(r.correct)} از {fa(r.attempts)}</td>
                            <td className={`px-3 py-2.5 font-black ${a >= 0.8 ? 'text-emerald-300' : a >= 0.6 ? 'text-amber-300' : 'text-rose-300'}`}>
                              {fa(Math.round(a * 100))}٪
                            </td>
                            <td className="px-3 py-2.5 text-orange-300">×{fa(r.bestStreak)}</td>
                            <td className="px-3 py-2.5 font-black text-amber-300">{fa(r.points)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* واژه‌های دشوار */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-100 mb-1">
                📌 واژه‌هایی که کلاس بیشتر اشتباه کرد
              </h3>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                این فهرست دقیقاً می‌گوید جلسهٔ بعد باید روی کدام قاعده‌ها کار کنی.
              </p>
              {missedWords.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-sm text-emerald-200">
                  ✨ آفرین! تا اینجا کلاس هیچ خطای ثبت‌شده‌ای نداشته است.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {missedWords.map(({ item, count }) => (
                    <div key={item!.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-black">
                        {fa(count)} خطا
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2.5">
                          <span className="text-base font-black text-emerald-300">{item!.correctSpelling}</span>
                          <span className="text-[11px] text-slate-500">
                            نادرست: {item!.incorrectVariants.map((v) => `«${v}»`).join('، ')}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{item!.ruleExplanation}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-600 self-center">
                        {spellingContentAdapter.getCategoryInfo(item!.category).short}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Modal>
  );
};
