import React, { useState, useEffect } from 'react';
import { ClassSessionState } from '../types/game';
import { Modal } from './Modal';
import { classSession } from '../services/ClassSession';
import { fa } from '../engine/world';
import { Users, BarChart3, Shuffle, ListOrdered, Trash2, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  session: ClassSessionState;
  onClose: () => void;
  onOpenReport: () => void;
}

export const ClassSessionModal: React.FC<Props> = ({ isOpen, session, onClose, onOpenReport }) => {
  const [className, setClassName] = useState(session.className);
  const [teacher, setTeacher] = useState(session.teacherName);
  const [rosterText, setRosterText] = useState(session.roster.join('\n'));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClassName(session.className);
      setTeacher(session.teacherName);
      setRosterText(session.roster.join('\n'));
      setSaved(false);
    }
  }, [isOpen, session.className, session.teacherName, session.roster]);

  const parsed = rosterText.split(/[\n،,]/).map((s) => s.trim()).filter(Boolean);

  const save = () => {
    classSession.setClassInfo(className.trim() || 'کلاس من', teacher.trim());
    classSession.setRoster(parsed);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const field = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="جلسهٔ کلاس"
      subtitle="فهرست دانش‌آموزان را وارد کن تا بازی نوبت‌ها و آمار هر نفر را خودش نگه دارد."
      icon="🧑‍🏫"
      accent="teal"
      size="md"
      footer={
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={save}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {saved ? 'ذخیره شد ✔' : 'ذخیرهٔ فهرست کلاس'}
          </button>
          <button
            onClick={onOpenReport}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> گزارش کلاس
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-xs text-teal-100/80 leading-relaxed">
          همهٔ اطلاعات فقط روی همین دستگاه ذخیره می‌شود؛ نه ثبت‌نامی لازم است و نه اینترنتی.
          صفحه را روی ویدئوپروژکتور بینداز و دانش‌آموزان به نوبت با موس، تخته هوشمند یا لمس صفحه شلیک کنند.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400">نام کلاس</span>
            <input className={field} value={className} onChange={(e) => setClassName(e.target.value)} placeholder="مثلاً ششم الف" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400">نام آموزگار (اختیاری)</span>
            <input className={field} value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="نام شما" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-400" /> فهرست دانش‌آموزان یا گروه‌ها
            </span>
            <span className="text-xs font-black text-teal-300">{fa(parsed.length)} نفر</span>
          </div>
          <textarea
            className={`${field} leading-loose resize-y`}
            rows={7}
            value={rosterText}
            onChange={(e) => setRosterText(e.target.value)}
            placeholder={'هر نام در یک سطر\nیا با ویرگول جدا شود\n\nمثال:\nسارا محمدی\nامیرحسین کریمی\nگروه سیمرغ'}
          />
        </label>

        <div>
          <span className="text-xs font-bold text-slate-400">شیوهٔ بازی در کلاس</span>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => classSession.setTurnMode('free')}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 ${
                session.turnMode === 'free'
                  ? 'bg-teal-500/15 border-teal-400 ring-1 ring-teal-400/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm text-slate-100">
                <Shuffle className="w-4 h-4 text-teal-400" /> آزاد
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                یک نفر یا خود معلم بازی می‌کند؛ آمار کلی کلاس ثبت می‌شود.
              </p>
            </button>
            <button
              onClick={() => classSession.setTurnMode('turns')}
              disabled={parsed.length === 0 && session.roster.length === 0}
              className={`p-3.5 rounded-2xl border text-right transition active:scale-95 disabled:opacity-40 ${
                session.turnMode === 'turns'
                  ? 'bg-teal-500/15 border-teal-400 ring-1 ring-teal-400/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm text-slate-100">
                <ListOrdered className="w-4 h-4 text-teal-400" /> نوبتی
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                بعد از هر پاسخ، نوبت به نفر بعدی می‌رسد و امتیاز به نام او ثبت می‌شود.
              </p>
            </button>
          </div>
        </div>

        {session.roster.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">فهرست ذخیره‌شده</span>
              <button
                onClick={() => {
                  if (window.confirm('آمار همهٔ دانش‌آموزان این جلسه پاک شود؟ (فهرست اسامی می‌ماند)')) {
                    classSession.resetStats();
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3 h-3" /> پاک کردن آمار جلسه
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto">
              {session.roster.map((n) => {
                const rec = session.students[n];
                const active = session.currentStudent === n;
                return (
                  <button
                    key={n}
                    onClick={() => classSession.setCurrentStudent(n)}
                    className={`px-2.5 py-1 rounded-xl text-xs border transition ${
                      active
                        ? 'bg-teal-500 text-slate-950 border-teal-300 font-black'
                        : 'bg-slate-900 border-teal-500/25 text-teal-100 hover:border-teal-400'
                    }`}
                  >
                    {n}
                    {rec && rec.attempts > 0 && (
                      <span className={`mr-1.5 ${active ? 'text-teal-900' : 'text-slate-500'}`}>
                        {fa(rec.correct)}/{fa(rec.attempts)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
