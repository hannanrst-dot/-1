import React from 'react';
import { SpellingItem } from '../types/game';
import { Modal } from './Modal';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { CheckCircle2, XCircle, Lightbulb, Quote } from 'lucide-react';

interface Props {
  isOpen: boolean;
  item: SpellingItem | null;
  projector: boolean;
  onClose: () => void;
}

export const ClassroomDiscussionModal: React.FC<Props> = ({ isOpen, item, projector, onClose }) => {
  if (!isOpen) return null;

  if (!item) {
    return (
      <Modal isOpen onClose={onClose} title="تحلیل کلاسی" icon="🎓" accent="indigo" size="sm">
        <p className="py-8 text-center text-sm text-slate-400 leading-relaxed">
          هنوز واژه‌ای در میدان داوری نشده است.<br />
          پس از نخستین شلیک، اینجا قاعده و معنی همان واژه را برای بحث کلاسی می‌بینی.
        </p>
      </Modal>
    );
  }

  const cat = spellingContentAdapter.getCategoryInfo(item.category);
  const big = projector;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="تحلیل کلاسیِ واژه"
      subtitle={`${cat.title} · ${spellingContentAdapter.getGradeDisplayName(item.grade)}`}
      icon="🎓"
      accent="indigo"
      size="md"
      projector={projector}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-l from-indigo-500 to-violet-400 hover:from-indigo-400 text-slate-950 font-black text-sm shadow-lg shadow-indigo-500/20 transition active:scale-95"
        >
          پایان بحث و ادامهٔ بازی
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* واژهٔ درست */}
        <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-gradient-to-b from-emerald-950/70 to-slate-950 border-2 border-emerald-500/50">
          <span className="text-[11px] font-black text-emerald-400">املای درست</span>
          <span className={`font-black text-emerald-200 tracking-wide ${big ? 'text-6xl' : 'text-5xl'}`}>
            {item.correctSpelling}
          </span>
          <p className={`text-slate-300 ${big ? 'text-lg' : 'text-sm'}`}>{item.meaning}</p>
        </div>

        {/* درست در برابر نادرست */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/50">
            <div className="flex items-center gap-2 mb-2 text-emerald-300 font-black text-xs">
              <CheckCircle2 className="w-4 h-4" /> درست بنویسیم
            </div>
            <div className={`font-black text-emerald-200 ${big ? 'text-3xl' : 'text-2xl'}`}>{item.correctSpelling}</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50">
            <div className="flex items-center gap-2 mb-2 text-rose-300 font-black text-xs">
              <XCircle className="w-4 h-4" /> نادرست‌های رایج
            </div>
            <div className="flex flex-wrap gap-2">
              {item.incorrectVariants.map((v) => (
                <span key={v} className={`font-bold text-rose-300/90 line-through decoration-rose-500/70 decoration-2 ${big ? 'text-2xl' : 'text-xl'}`}>
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* قاعده */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/50">
          <div className="flex items-center gap-2 mb-2 text-amber-300 font-black text-xs">
            <Lightbulb className="w-4 h-4" /> چرا این‌طور می‌نویسیم؟
          </div>
          <p className={`text-slate-100 leading-relaxed ${big ? 'text-lg' : 'text-sm'}`}>{item.ruleExplanation}</p>
        </div>

        {/* جمله */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-sky-300 font-black text-xs">
            <Quote className="w-4 h-4" /> در جمله
          </div>
          <p className={`text-slate-200 leading-relaxed ${big ? 'text-lg' : 'text-sm'}`}>{item.sentence}</p>
        </div>

        {/* پرسش‌های گفت‌وگو */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60">
          <div className="mb-2 text-indigo-300 font-black text-xs">پرسش برای کلاس</div>
          <ul className={`list-disc pr-5 space-y-1.5 text-slate-300 leading-relaxed ${big ? 'text-base' : 'text-xs'}`}>
            <li>چه واژهٔ هم‌خانواده‌ای برای «{item.correctSpelling}» می‌شناسید؟</li>
            <li>اگر این واژه را غلط بنویسیم، معنی جمله چه می‌شود؟</li>
            <li>یک جملهٔ تازه با این واژه بسازید و روی تخته بنویسید.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
