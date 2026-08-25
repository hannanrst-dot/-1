import React, { useState } from 'react';
import { SpellingCategory } from '../types/game';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import { X, Search, Volume2, Lightbulb, CheckCircle2 } from 'lucide-react';

interface SpellingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpellingGuideModal: React.FC<SpellingGuideModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<SpellingCategory>('all');

  if (!isOpen) return null;

  const allItems = spellingContentAdapter.getAllItems();
  const filtered = allItems.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.category === selectedCat;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.word.includes(searchTerm.trim()) ||
      item.meaning.includes(searchTerm.trim()) ||
      item.ruleExplanation.includes(searchTerm.trim());
    return matchesCat && matchesSearch;
  });

  const categories: SpellingCategory[] = [
    'all',
    's_s_th',
    'z_z_z_z',
    't_t',
    'gh_gh',
    'h_h',
    'khva',
    'tashdid',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            📖
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">دانشنامه و راهنمای املای کلمات</h2>
            <p className="text-xs text-slate-400">
              قواعد، ریشه‌ها و ترفندهای یادگیری حروف چندشکلی و هم‌صدا در زبان فارسی
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی واژه، معنی یا قاعده املایی..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCat === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {spellingContentAdapter.getCategoryDisplayName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Dictionary Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-300">{item.correctSpelling}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {spellingContentAdapter.getCategoryDisplayName(item.category)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.meaning}</p>
                </div>

                <button
                  onClick={() => audioService.speakPersian(item.word)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                  title="پخش تلفظ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Rule */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{item.ruleExplanation}</span>
              </div>

              {/* Common mistakes */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-bold">اشتباه متداول:</span>
                <span className="text-rose-400 line-through">
                  {item.incorrectVariants.join('، ')}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 p-8 text-center text-slate-500 text-xs">
              واژه‌ای مطابق با جستجوی شما یافت نشد.
            </div>
          )}
        </div>

        {/* Footer Mnemonic Tips */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <p className="text-xs text-indigo-200 leading-relaxed">
            <strong className="text-amber-300">ترفند یادگیری:</strong> برای تشخیص واژه‌های هم‌صدا، همیشه به کلمات هم‌خانواده (مانند درس ➔ مدرسه، نظر ➔ منظره، نظم ➔ ناظم) توجه کنید.
          </p>
        </div>
      </div>
    </div>
  );
};
