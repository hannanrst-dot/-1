import React from 'react';
import { SpellingItem } from '../types/game';
import { audioService } from '../services/AudioService';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { Volume2, X, BookOpen, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

interface ClassroomDiscussionModalProps {
  isOpen: boolean;
  item: SpellingItem | null;
  onClose: () => void;
  isProjectorMode: boolean;
}

export const ClassroomDiscussionModal: React.FC<ClassroomDiscussionModalProps> = ({
  isOpen,
  item,
  onClose,
  isProjectorMode,
}) => {
  if (!isOpen || !item) return null;

  const handleSpeak = () => {
    audioService.speakPersian(item.word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div
        className={`relative w-full ${
          isProjectorMode ? 'max-w-3xl' : 'max-w-2xl'
        } bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300 text-2xl">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                تحلیل و بررسی کلاسی
              </span>
              <span className="text-xs text-slate-400">
                {spellingContentAdapter.getCategoryDisplayName(item.category)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              بررسی املای کلمه در کلاس درس
            </h2>
          </div>
        </div>

        {/* Word Showcase Board */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-6 rounded-2xl border border-indigo-500/40 flex flex-col items-center justify-center text-center gap-3">
          <div className="text-xs text-indigo-300 font-bold">املای صحیح و استاندارد</div>
          <div className="text-4xl lg:text-5xl font-black text-amber-300 tracking-wider">
            {item.correctSpelling}
          </div>

          <button
            onClick={handleSpeak}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95 mt-1"
          >
            <Volume2 className="w-4 h-4" />
            <span>پخش تلفظ صوتی واژه</span>
          </button>
        </div>

        {/* Spelling Rule & Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule Card */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lightbulb className="w-4 h-4" />
              <span>قاعده و ریشه املایی</span>
            </div>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {item.ruleExplanation}
            </p>
          </div>

          {/* Meaning & Usage */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>معنی و کاربرد در جمله</span>
            </div>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {item.meaning}
            </p>
            {item.audioPhrase && (
              <div className="mt-2 text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                «{item.audioPhrase}»
              </div>
            )}
          </div>
        </div>

        {/* Correct vs Incorrect Comparison */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400">مقایسه فرم صحیح با خطاهای متداول:</span>
          <div className="flex flex-wrap items-center gap-3">
            {/* Correct Form */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-sm font-black">
              <CheckCircle className="w-4 h-4" />
              <span>{item.correctSpelling} (صحیح)</span>
            </div>

            {/* Incorrect Forms */}
            {item.incorrectVariants.map((inc, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm font-medium line-through"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{inc} (غلط)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition active:scale-98"
        >
          ادامه بازی و پرتاب تیرها 🏹
        </button>
      </div>
    </div>
  );
};
