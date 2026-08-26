import React from 'react';
import { ArrowType, LevelConfig, ArcherBow } from '../types/game';
import { fa } from '../engine/world';
import { ARROW_SHOP } from '../services/WorldData';
import { Volume2, VolumeX, Tv, HelpCircle, Pause, Sparkles, Flame, MessageSquareQuote, Users } from 'lucide-react';

interface Props {
  score: number;
  coins: number;
  combo: number;
  equippedBow: ArcherBow;
  arrowType: ArrowType;
  inventory: Record<ArrowType, number>;
  projector: boolean;
  muted: boolean;
  level: LevelConfig;
  currentStudent: string | null;
  turnMode: 'free' | 'turns';
  onSelectArrowType: (t: ArrowType) => void;
  onToggleProjector: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenGuide: () => void;
  onOpenDiscussion: () => void;
  onOpenStudents: () => void;
  onOpenArmory: () => void;
}

const comboBadge = (c: number) => {
  if (c >= 12) return { title: 'افسانهٔ زبان فارسی', emoji: '👑' };
  if (c >= 8) return { title: 'استاد املا', emoji: '🏆' };
  if (c >= 5) return { title: 'شکارچی حرفه‌ای', emoji: '⚡' };
  if (c >= 3) return { title: 'زنجیرهٔ درست‌نویسی', emoji: '🔥' };
  return null;
};

export const HUD: React.FC<Props> = ({
  score, coins, combo, equippedBow, arrowType, inventory, projector, muted, level,
  currentStudent, turnMode,
  onSelectArrowType, onToggleProjector, onToggleMute, onPause,
  onOpenGuide, onOpenDiscussion, onOpenStudents, onOpenArmory,
}) => {
  const badge = comboBadge(combo);
  const big = projector;
  const iconBtn = `rounded-xl border border-slate-700/80 bg-slate-900/85 hover:bg-slate-800 text-slate-300 shadow-lg backdrop-blur-md transition active:scale-95 ${big ? 'p-3' : 'p-2.5'}`;
  const chip = `flex items-center gap-2 rounded-xl bg-slate-900/85 border shadow-lg backdrop-blur-md ${big ? 'px-4 py-2' : 'px-3 py-1.5'}`;

  return (
    <>
      {/* ── نوار بالا ── */}
      <div className="relative z-30 shrink-0 w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-slate-950/95 to-slate-950/40 border-b border-slate-800/60">
        <button onClick={onPause} className={iconBtn} title="توقف بازی (Esc)">
          <Pause className={big ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>

        <div className={`hidden sm:flex flex-col leading-tight rounded-xl bg-slate-900/85 border border-slate-700/80 shadow-lg backdrop-blur-md ${big ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
          <span className={`text-slate-400 font-bold ${big ? 'text-xs' : 'text-[10px]'}`}>
            مرحلهٔ {fa(level.levelNumber)}
          </span>
          <span className={`font-bold text-slate-100 ${big ? 'text-base' : 'text-sm'}`}>{level.title}</span>
        </div>

        <div className={`${chip} border-amber-500/40`}>
          <Sparkles className={`text-amber-400 ${big ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div className="flex flex-col leading-tight">
            <span className={`text-slate-400 ${big ? 'text-[11px]' : 'text-[10px]'}`}>امتیاز</span>
            <span className={`font-black text-amber-300 ${big ? 'text-lg' : 'text-sm'}`}>{fa(score)}</span>
          </div>
        </div>

        <button onClick={onOpenArmory} className={`${chip} border-yellow-500/40 hover:bg-slate-800/90 active:scale-95`} title="فروشگاه تجهیزات">
          <span className={big ? 'text-lg' : 'text-sm'}>🪙</span>
          <div className="flex flex-col leading-tight items-start">
            <span className={`text-slate-400 ${big ? 'text-[11px]' : 'text-[10px]'}`}>سکه</span>
            <span className={`font-black text-yellow-300 ${big ? 'text-lg' : 'text-sm'}`}>{fa(coins)}</span>
          </div>
        </button>

        {/* کمبو */}
        <div className="flex-1 flex justify-center">
          {combo >= 2 && (
            <div className={`flex items-center gap-2 rounded-2xl bg-gradient-to-l from-orange-600/90 to-amber-500/90 border border-amber-300/70 shadow-xl backdrop-blur-md ${big ? 'px-5 py-2' : 'px-3.5 py-1.5'}`}>
              <Flame className={`text-yellow-200 animate-pulse ${big ? 'w-6 h-6' : 'w-5 h-5'}`} />
              <span className={`font-black text-white ${big ? 'text-xl' : 'text-base'}`}>×{fa(combo)}</span>
              {badge && (
                <span className={`hidden md:inline font-extrabold text-amber-50 ${big ? 'text-base' : 'text-xs'}`}>
                  {badge.emoji} {badge.title}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ابزار کلاس */}
        <button
          onClick={onOpenDiscussion}
          className={`flex items-center gap-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold border border-indigo-400/60 shadow-lg backdrop-blur-md transition active:scale-95 ${big ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'}`}
          title="توقف و تحلیل املای واژهٔ جاری در کلاس"
        >
          <MessageSquareQuote className={big ? 'w-5 h-5' : 'w-4 h-4'} />
          <span className="hidden lg:inline">تحلیل کلاسی</span>
        </button>

        <button
          onClick={onOpenStudents}
          className={`flex items-center gap-1.5 rounded-xl font-bold border shadow-lg backdrop-blur-md transition active:scale-95 ${
            turnMode === 'turns'
              ? 'bg-teal-500 text-slate-950 border-teal-300'
              : 'bg-teal-600/90 hover:bg-teal-500 text-white border-teal-400/60'
          } ${big ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'}`}
          title="گردونه و نوبت دانش‌آموزان"
        >
          <Users className={big ? 'w-5 h-5' : 'w-4 h-4'} />
          <span className="hidden lg:inline truncate max-w-[120px]">
            {currentStudent ? `نوبت: ${currentStudent}` : 'نوبت دانش‌آموز'}
          </span>
        </button>

        <button
          onClick={onToggleProjector}
          className={`${iconBtn} ${projector ? '!bg-amber-400 !text-slate-950 !border-amber-300' : ''}`}
          title="حالت ویدئوپروژکتور (قلم درشت‌تر و کنتراست بالاتر)"
        >
          <Tv className={big ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>

        <button onClick={onOpenGuide} className={iconBtn} title="راهنمای املا">
          <HelpCircle className={big ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>

        <button onClick={onToggleMute} className={iconBtn} title={muted ? 'روشن کردن صدا' : 'قطع صدا'}>
          {muted
            ? <VolumeX className={`text-rose-400 ${big ? 'w-6 h-6' : 'w-5 h-5'}`} />
            : <Volume2 className={`text-emerald-400 ${big ? 'w-6 h-6' : 'w-5 h-5'}`} />}
        </button>
      </div>

      {/* ── ستون تیرهای ویژه (کنار میدان) ── */}
      <div className="absolute z-30 left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-700/70 shadow-2xl backdrop-blur-md">
        <ArrowButton
          active={arrowType === 'standard'} icon="🏹" label="تیر ساده" count={null} hotkey="۱"
          big={big} onClick={() => onSelectArrowType('standard')}
        />
        {ARROW_SHOP.map((a, i) => (
          <ArrowButton
            key={a.type}
            active={arrowType === a.type}
            icon={a.icon}
            label={a.name}
            count={inventory[a.type] ?? 0}
            hotkey={fa(i + 2)}
            big={big}
            onClick={() => onSelectArrowType(a.type)}
          />
        ))}
        <div className={`mt-0.5 pt-1.5 border-t border-slate-700/60 text-center text-slate-500 ${big ? 'text-[11px]' : 'text-[9px]'}`}>
          {equippedBow.icon}
        </div>
      </div>
    </>
  );
};

const ArrowButton: React.FC<{
  active: boolean; icon: string; label: string; count: number | null;
  hotkey: string; big: boolean; onClick: () => void;
}> = ({ active, icon, label, count, hotkey, big, onClick }) => {
  const empty = count !== null && count <= 0;
  return (
    <button
      onClick={onClick}
      disabled={empty}
      title={`${label} — کلید ${hotkey}`}
      className={`group relative flex items-center justify-center rounded-xl transition active:scale-95 ${
        big ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg'
      } ${
        active
          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-200'
          : empty
          ? 'bg-slate-900/60 opacity-35 cursor-not-allowed'
          : 'bg-slate-800/80 hover:bg-slate-700'
      }`}
    >
      <span>{icon}</span>
      {count !== null && (
        <span className={`absolute -bottom-1 -left-1 min-w-[18px] px-1 rounded-full font-black border ${
          empty
            ? 'bg-slate-900 text-slate-600 border-slate-700'
            : 'bg-slate-950 text-amber-300 border-amber-500/50'
        } ${big ? 'text-[11px]' : 'text-[9px]'}`}>
          {fa(count)}
        </span>
      )}
      <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-200 opacity-0 group-hover:opacity-100 transition">
        {label}
      </span>
    </button>
  );
};
