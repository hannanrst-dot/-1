import React from 'react';
import { MissionConfig, ArrowType } from '../types/game';
import { fa } from '../engine/world';
import { ARROW_SHOP } from '../services/WorldData';
import { Heart, Clock, Volume2, VolumeX, Tv, Flame } from 'lucide-react';

interface Props {
  config: MissionConfig;
  answered: number;
  correct: number;
  livesLeft: number;
  secondsLeft: number;
  combo: number;
  score: number;
  coins: number;
  arrowType: ArrowType;
  inventory: Record<ArrowType, number>;
  projector: boolean;
  muted: boolean;
  showEconomy: boolean;
  onSelectArrowType: (t: ArrowType) => void;
  onToggleProjector: () => void;
  onToggleMute: () => void;
}

const mmss = (s: number) => `${fa(Math.floor(s / 60))}:${fa(String(Math.floor(s % 60)).padStart(2, '0'))}`;

/** نوار بالای مأموریت — عمداً ساده‌تر از HUD بازی آزاد است تا حواس‌پرتی نداشته باشد */
export const MissionHud: React.FC<Props> = ({
  config, answered, correct, livesLeft, secondsLeft, combo, score, coins,
  arrowType, inventory, projector, muted, showEconomy,
  onSelectArrowType, onToggleProjector, onToggleMute,
}) => {
  const pct = (answered / Math.max(1, config.questionCount)) * 100;
  const low = config.durationSec > 0 && secondsLeft <= 30;
  const big = projector;
  const iconBtn = `rounded-xl border border-slate-700/80 bg-slate-900/85 hover:bg-slate-800 text-slate-300 transition active:scale-95 ${big ? 'p-3' : 'p-2.5'}`;
  const hasArrows = showEconomy && ARROW_SHOP.some((a) => (inventory[a.type] ?? 0) > 0);

  return (
    <>
      <div className="relative z-30 shrink-0 w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-slate-950/95 to-slate-950/40 border-b border-slate-800/60">
        {/* عنوان و نام دانش‌آموز */}
        <div className="hidden sm:flex flex-col leading-tight px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80">
          <span className={`font-bold text-amber-400 ${big ? 'text-xs' : 'text-[10px]'}`}>
            {config.kind === 'exam' ? 'آزمون املا' : 'تمرین املا'}
          </span>
          <span className={`font-bold text-slate-100 ${big ? 'text-base' : 'text-sm'}`}>{config.student.name}</span>
        </div>

        {/* پیشرفت */}
        <div className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-black text-slate-100 ${big ? 'text-base' : 'text-xs'}`}>
              پرسش {fa(Math.min(answered + 1, config.questionCount))} از {fa(config.questionCount)}
            </span>
            <span className={`font-bold text-emerald-300 ${big ? 'text-sm' : 'text-[11px]'}`}>
              {fa(correct)} پاسخ درست
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-sky-400 transition-all duration-500"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        {/* کمبو */}
        {combo >= 3 && (
          <div className={`hidden md:flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-orange-600/90 to-amber-500/90 border border-amber-300/70 ${big ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
            <Flame className={`text-yellow-200 ${big ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={`font-black text-white ${big ? 'text-lg' : 'text-sm'}`}>×{fa(combo)}</span>
          </div>
        )}

        {/* جان */}
        <div className="flex items-center gap-1 shrink-0" title={`جان باقی‌مانده: ${fa(livesLeft)}`}>
          {Array.from({ length: Math.min(config.lives, 6) }).map((_, i) => (
            <Heart
              key={i}
              className={`${big ? 'w-6 h-6' : 'w-4.5 h-4.5'} ${
                i < livesLeft ? 'text-rose-400 fill-rose-500' : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
          {config.lives > 6 && (
            <span className="text-xs font-black text-rose-300">{fa(livesLeft)}</span>
          )}
        </div>

        {/* زمان */}
        {config.durationSec > 0 && (
          <div className={`flex items-center gap-1.5 rounded-xl border shrink-0 ${big ? 'px-4 py-2' : 'px-3 py-1.5'} ${
            low ? 'bg-rose-950/80 border-rose-500/60 animate-pulse' : 'bg-slate-900/85 border-slate-700/80'
          }`}>
            <Clock className={`${low ? 'text-rose-300' : 'text-slate-400'} ${big ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={`font-black tabular-nums ${low ? 'text-rose-200' : 'text-slate-100'} ${big ? 'text-lg' : 'text-sm'}`}>
              {mmss(secondsLeft)}
            </span>
          </div>
        )}

        {showEconomy && (
          <div className={`hidden lg:flex items-center gap-2 rounded-xl bg-slate-900/85 border border-amber-500/40 ${big ? 'px-4 py-2' : 'px-3 py-1.5'}`}>
            <span className="text-sm">🪙</span>
            <span className={`font-black text-amber-300 ${big ? 'text-base' : 'text-sm'}`}>{fa(coins)}</span>
            <span className="text-slate-600">·</span>
            <span className={`font-black text-emerald-300 ${big ? 'text-base' : 'text-sm'}`}>{fa(score)}</span>
          </div>
        )}

        <button onClick={onToggleProjector} className={`${iconBtn} ${projector ? '!bg-amber-400 !text-slate-950 !border-amber-300' : ''}`} title="حالت ویدئوپروژکتور">
          <Tv className={big ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>
        <button onClick={onToggleMute} className={iconBtn} title={muted ? 'روشن کردن صدا' : 'قطع صدا'}>
          {muted ? <VolumeX className={`text-rose-400 ${big ? 'w-6 h-6' : 'w-5 h-5'}`} />
                 : <Volume2 className={`text-emerald-400 ${big ? 'w-6 h-6' : 'w-5 h-5'}`} />}
        </button>
      </div>

      {/* تیرهای ویژه — فقط اگر دانش‌آموز داشته باشد */}
      {hasArrows && (
        <div className="absolute z-30 left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-700/70 shadow-2xl backdrop-blur-md">
          <MiniArrow active={arrowType === 'standard'} icon="🏹" count={null} big={big} onClick={() => onSelectArrowType('standard')} />
          {ARROW_SHOP.filter((a) => (inventory[a.type] ?? 0) > 0).map((a) => (
            <MiniArrow
              key={a.type}
              active={arrowType === a.type}
              icon={a.icon}
              count={inventory[a.type]}
              big={big}
              onClick={() => onSelectArrowType(a.type)}
            />
          ))}
        </div>
      )}
    </>
  );
};

const MiniArrow: React.FC<{ active: boolean; icon: string; count: number | null; big: boolean; onClick: () => void }> = ({
  active, icon, count, big, onClick,
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center rounded-xl transition active:scale-95 ${
      big ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg'
    } ${active ? 'bg-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-200' : 'bg-slate-800/80 hover:bg-slate-700'}`}
  >
    <span>{icon}</span>
    {count !== null && (
      <span className={`absolute -bottom-1 -left-1 min-w-[18px] px-1 rounded-full font-black bg-slate-950 text-amber-300 border border-amber-500/50 ${big ? 'text-[11px]' : 'text-[9px]'}`}>
        {fa(count)}
      </span>
    )}
  </button>
);
