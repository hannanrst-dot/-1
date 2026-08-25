import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { audioService } from '../services/AudioService';
import { Star, RotateCcw, ArrowRight, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelVictoryModalProps {
  isOpen: boolean;
  starsEarned: number;
  level: LevelConfig;
  scoreGained: number;
  highestCombo: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onBackToMap: () => void;
}

export const LevelVictoryModal: React.FC<LevelVictoryModalProps> = ({
  isOpen,
  starsEarned,
  level,
  scoreGained,
  highestCombo,
  onNextLevel,
  onReplay,
  onBackToMap,
}) => {
  useEffect(() => {
    if (isOpen) {
      audioService.playTargetHit(true, 5);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const coinsEarned = starsEarned * 50 + highestCombo * 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center gap-5">
        {/* Victory Icon / Crest */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 animate-bounce">
          🏆
        </div>

        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-100 to-yellow-400 bg-clip-text text-transparent">
            پیروزی چشمگیر در میدان!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            مرحله «{level.title}» با موفقیت به پایان رسید
          </p>
        </div>

        {/* 3 Animated Stars */}
        <div className="flex items-center gap-3 my-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`p-3 rounded-2xl transition-all duration-500 transform ${
                s <= starsEarned
                  ? 'bg-amber-500/20 border-2 border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800/40 border border-slate-700 opacity-40 scale-90'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  s <= starsEarned ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-slate-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Score */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400">امتیاز مرحله</span>
            <span className="text-sm font-black text-emerald-300">
              +{scoreGained.toLocaleString('fa-IR')}
            </span>
          </div>

          {/* Highest Combo */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <Award className="w-4 h-4 text-orange-400 mb-1" />
            <span className="text-[10px] text-slate-400">بیشترین کمبو</span>
            <span className="text-sm font-black text-orange-300">x{highestCombo}</span>
          </div>

          {/* Coins Earned */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-base mb-0.5">🪙</span>
            <span className="text-[10px] text-slate-400">سکه دریافتی</span>
            <span className="text-sm font-black text-yellow-300">
              +{coinsEarned.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>

        {/* Buttons Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
          {/* Next Level */}
          <button
            onClick={onNextLevel}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>مرحله بعدی</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {/* Replay */}
          <button
            onClick={onReplay}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تکرار</span>
          </button>

          {/* Back to Map */}
          <button
            onClick={onBackToMap}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition active:scale-95"
          >
            نقشه
          </button>
        </div>
      </div>
    </div>
  );
};
