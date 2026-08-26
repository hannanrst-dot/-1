import React from 'react';
import { LevelConfig } from '../types/game';
import { Modal } from './Modal';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { Play, RotateCcw, Map, Tv, Volume2, VolumeX, Music, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  level: LevelConfig | null;
  projector: boolean;
  muted: boolean;
  musicOn: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMap: () => void;
  onToggleProjector: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenGuide: () => void;
}

export const PauseModal: React.FC<Props> = ({
  isOpen, level, projector, muted, musicOn,
  onResume, onRestart, onMap,
  onToggleProjector, onToggleMute, onToggleMusic, onOpenGuide,
}) => {
  if (!level) return null;
  const info = spellingContentAdapter.getGameModeDisplayName(level.mode);
  const cat = spellingContentAdapter.getCategoryInfo(level.category);

  const toggle = (on: boolean) =>
    `flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs border transition active:scale-95 ${
      on ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onResume}
      title="بازی متوقف شد"
      subtitle={`${level.title} — ${info.fa}`}
      icon="⏸️"
      accent="slate"
      size="sm"
      projector={projector}
    >
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm font-bold text-amber-300">{cat.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{cat.rule}</p>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-bold">هدف این مرحله: </span>{info.how}
          </p>
        </div>

        <button
          onClick={onResume}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" /> ادامهٔ بازی
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={onRestart} className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> شروع دوباره
          </button>
          <button onClick={onMap} className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2">
            <Map className="w-4 h-4" /> نقشهٔ سرزمین‌ها
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={onToggleProjector} className={toggle(projector)}>
            <Tv className="w-4 h-4" /> حالت پروژکتور
          </button>
          <button onClick={onToggleMusic} className={toggle(musicOn)}>
            <Music className="w-4 h-4" /> موسیقی زمینه
          </button>
          <button onClick={onToggleMute} className={toggle(!muted)}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} صدای بازی
          </button>
          <button onClick={onOpenGuide} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition active:scale-95">
            <BookOpen className="w-4 h-4" /> راهنمای املا
          </button>
        </div>
      </div>
    </Modal>
  );
};
