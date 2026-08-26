import React, { useState, useMemo } from 'react';
import { SpellingCategory } from '../types/game';
import { Modal } from './Modal';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import { fa } from '../engine/world';
import { Search, Volume2, Lightbulb } from 'lucide-react';

const CATS: SpellingCategory[] = [
  'all', 's_s_th', 'z_z_z_z', 't_t', 'gh_gh', 'h_h', 'khva', 'tanvin', 'gozar', 'peyvaste',
];

export const SpellingGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<SpellingCategory>('all');

  const items = useMemo(() => {
    if (!isOpen) return [];
    const all = spellingContentAdapter.getAllItems();
    const term = q.trim();
    return all.filter((i) => {
      if (cat !== 'all' && i.category !== cat) return false;
      if (!term) return true;
      return (
        i.word.includes(term) ||
        i.meaning.includes(term) ||
        i.ruleExplanation.includes(term) ||
        i.incorrectVariants.some((v) => v.includes(term))
      );
    });
  }, [isOpen, q, cat]);

  const info = spellingContentAdapter.getCategoryInfo(cat);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="دانشنامهٔ املای فارسی"
      subtitle={`${fa(spellingContentAdapter.getAllItems().length)} واژه با قاعده، معنی و نمونه در جمله`}
      icon="📖"
      accent="amber"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* جست‌وجو */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جست‌وجوی واژه، معنی یا قاعده…"
            className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* دسته‌ها */}
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => {
            const ci = spellingContentAdapter.getCategoryInfo(c);
            const on = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${
                  on ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{ci.icon}</span> {ci.short}
              </button>
            );
          })}
        </div>

        {/* قاعدهٔ دسته */}
        {cat !== 'all' && (
          <div className="p-4 rounded-2xl bg-gradient-to-l from-amber-950/50 to-slate-950 border border-amber-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{info.icon}</span>
              <h3 className="text-base font-black text-amber-200">{info.title}</h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{info.rule}</p>
            <ul className="mt-3 space-y-1.5">
              {info.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* فهرست واژه‌ها */}
        <div className="text-xs text-slate-500">{fa(items.length)} واژه</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {items.map((i) => (
            <div key={i.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black text-emerald-300">{i.correctSpelling}</span>
                  {i.incorrectVariants.slice(0, 2).map((v) => (
                    <span key={v} className="text-sm text-rose-400/80 line-through decoration-rose-500/60">{v}</span>
                  ))}
                  {i.isCustom && (
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-bold">
                      واژهٔ معلم
                    </span>
                  )}
                </div>
                <button
                  onClick={() => audioService.speakPersian(i.word)}
                  className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 transition"
                  title="شنیدن واژه"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">{i.meaning}</p>
              <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">{i.ruleExplanation}</p>
              <p className="mt-1.5 text-[11px] text-slate-500 italic">«{i.sentence}»</p>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-500">
              واژه‌ای با این جست‌وجو پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
