import React from 'react';
import { PlayerProgress } from '../types/game';
import { Modal } from './Modal';
import { ACHIEVEMENTS } from '../services/Achievements';
import { fa } from '../engine/world';
import { Lock, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  progress: PlayerProgress;
  onClose: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ isOpen, progress, onClose }) => {
  const rows = ACHIEVEMENTS.map((a) => ({ a, p: Math.max(0, Math.min(1, a.progress(progress))) }));
  const got = rows.filter((r) => r.p >= 1).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="نشان‌های شکارچی"
      subtitle={`${fa(got)} نشان از ${fa(ACHIEVEMENTS.length)} به دست آمده`}
      icon="🏅"
      accent="amber"
      size="md"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rows
          .slice()
          .sort((x, y) => (y.p >= 1 ? 1 : 0) - (x.p >= 1 ? 1 : 0) || y.p - x.p)
          .map(({ a, p }) => {
            const on = p >= 1;
            return (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                  on
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div
                  className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border ${
                    on ? 'bg-amber-500/20 border-amber-400/50' : 'bg-slate-900 border-slate-800 grayscale opacity-45'
                  }`}
                >
                  {on ? a.icon : <Lock className="w-4 h-4 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${on ? 'text-amber-200' : 'text-slate-300'}`}>{a.title}</span>
                    {on && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{a.hint}</p>
                  {!on && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-amber-400 to-yellow-300 transition-all duration-700"
                          style={{ width: `${p * 100}%` }}
                        />
                      </div>
                      {a.label && (
                        <div className="mt-1 text-[10px] text-slate-500">{fa(a.label(progress))}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </Modal>
  );
};
