import React from 'react';
import { ArrowType, LevelConfig, ArcherBow } from '../types/game';
import {
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Pause,
  Sparkles,
  Flame,
  Award,
  Users,
} from 'lucide-react';

interface HUDProps {
  score: number;
  coins: number;
  currentCombo: number;
  highestCombo: number;
  equippedBow: ArcherBow;
  activeArrowType: ArrowType;
  arrowInventory: Record<ArrowType, number>;
  isProjectorMode: boolean;
  isMuted: boolean;
  level: LevelConfig;
  onSelectArrowType: (type: ArrowType) => void;
  onToggleProjectorMode: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenSpellingGuide: () => void;
  onOpenClassDiscussion: () => void;
  onOpenStudentPicker: () => void;
  onOpenArmory: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  coins,
  currentCombo,
  activeArrowType,
  arrowInventory,
  isProjectorMode,
  isMuted,
  level,
  onSelectArrowType,
  onToggleProjectorMode,
  onToggleMute,
  onPause,
  onOpenSpellingGuide,
  onOpenClassDiscussion,
  onOpenStudentPicker,
  onOpenArmory,
}) => {
  // Determine Combo Badge Name & Colors
  const getComboBadge = (combo: number) => {
    if (combo >= 10) return { title: 'افسانه زبان فارسی 👑', color: 'from-amber-400 to-yellow-600', text: 'text-amber-200' };
    if (combo >= 8) return { title: 'استاد املا 🏆', color: 'from-purple-500 to-indigo-600', text: 'text-purple-200' };
    if (combo >= 5) return { title: 'شکارچی حرفه‌ای ⚡', color: 'from-blue-500 to-cyan-600', text: 'text-cyan-200' };
    if (combo >= 3) return { title: 'ترکیب کلمات 🔥', color: 'from-orange-500 to-amber-600', text: 'text-amber-200' };
    return null;
  };

  const comboBadge = getComboBadge(currentCombo);

  return (
    <div className="pointer-events-none w-full flex flex-col justify-between p-3 select-none">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Left Side: Score, Coins, Level Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Pause / Map */}
          <button
            onClick={onPause}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg backdrop-blur-md transition active:scale-95"
            title="توقف و نقشه"
          >
            <Pause className="w-5 h-5" />
          </button>

          {/* Level Title Badge */}
          <div className="hidden sm:flex flex-col px-3.5 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-lg backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400">مرحله {level.levelNumber}</span>
            <span className="text-sm font-bold text-slate-100">{level.title}</span>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/85 border border-amber-500/40 shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-tight">امتیاز</span>
              <span className="text-sm font-black text-amber-400 tracking-wider">
                {score.toLocaleString('fa-IR')}
              </span>
            </div>
          </div>

          {/* Coins Counter */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-yellow-500/40 shadow-lg backdrop-blur-md transition active:scale-95"
            title="فروشگاه کماندار"
          >
            <span className="text-sm">🪙</span>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-400 leading-tight">سکه‌ها</span>
              <span className="text-sm font-black text-yellow-300">
                {coins.toLocaleString('fa-IR')}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Combo Multiplier Streak */}
        {currentCombo >= 2 && (
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-orange-600/90 to-amber-600/90 border border-amber-400 shadow-xl backdrop-blur-md animate-bounce">
            <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-amber-200">کمبو:</span>
              <span className="text-base font-black text-white">x{currentCombo}</span>
            </div>
            {comboBadge && (
              <span className="hidden md:inline text-xs font-extrabold text-amber-100 mr-1">
                {comboBadge.title}
              </span>
            )}
          </div>
        )}

        {/* Right Side: Classroom Controls & Sound */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Classroom Discussion / Freeze Button */}
          <button
            onClick={onOpenClassDiscussion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-400/60 shadow-lg backdrop-blur-md transition active:scale-95"
            title="تحلیل و توقف کلاسی"
          >
            <Award className="w-4 h-4 text-yellow-300" />
            <span className="hidden lg:inline">تحلیل کلاسی املا</span>
          </button>

          {/* Student Roulette Picker Button */}
          <button
            onClick={onOpenStudentPicker}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white font-bold text-xs border border-teal-400/60 shadow-lg backdrop-blur-md transition active:scale-95"
            title="گردونه انتخاب دانش‌آموز"
          >
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">نوبت دانش‌آموز</span>
          </button>

          {/* Projector Mode Toggle */}
          <button
            onClick={onToggleProjectorMode}
            className={`p-2.5 rounded-xl border shadow-lg backdrop-blur-md transition active:scale-95 ${
              isProjectorMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
            title="حالت ویدئو پروژکتور کلاس (قلم درشت و کنتراست بالا)"
          >
            <Tv className="w-5 h-5" />
          </button>

          {/* Spelling Guide Dictionary */}
          <button
            onClick={onOpenSpellingGuide}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-lg backdrop-blur-md transition active:scale-95"
            title="راهنمای املای کلمات و ترفندها"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Mute Audio */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-lg backdrop-blur-md transition active:scale-95"
            title={isMuted ? 'فعال‌سازی صدا' : 'قطع صدا'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Bottom HUD: Special Arrow Hotbar */}
      <div className="flex items-center justify-between w-full mt-auto">
        {/* Special Arrow Selector Bar */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md">
          {/* Standard Arrow */}
          <button
            onClick={() => onSelectArrowType('standard')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition ${
              activeArrowType === 'standard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="text-base">🏹</span>
            <span className="text-xs">تیر استاندارد</span>
            <span className="text-[10px] opacity-75 font-mono">∞</span>
          </button>

          {/* Fire Arrow */}
          <button
            onClick={() => onSelectArrowType('fire')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition ${
              activeArrowType === 'fire'
                ? 'bg-orange-500 text-white font-bold shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="text-base">🔥</span>
            <span className="text-xs hidden sm:inline">تیر آتشین</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-950/60 text-orange-300 border border-orange-500/40">
              {arrowInventory.fire}
            </span>
          </button>

          {/* Slow-mo Ice Arrow */}
          <button
            onClick={() => onSelectArrowType('slow_mo')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition ${
              activeArrowType === 'slow_mo'
                ? 'bg-sky-500 text-white font-bold shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="text-base">❄️</span>
            <span className="text-xs hidden sm:inline">تیر بلورین (آهسته)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/60 text-sky-300 border border-sky-500/40">
              {arrowInventory.slow_mo}
            </span>
          </button>

          {/* Multi-Shot Arrow */}
          <button
            onClick={() => onSelectArrowType('multi_shot')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition ${
              activeArrowType === 'multi_shot'
                ? 'bg-purple-500 text-white font-bold shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="text-base">✨</span>
            <span className="text-xs hidden sm:inline">تیر سه‌گانه</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-500/40">
              {arrowInventory.multi_shot}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
