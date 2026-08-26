import React from 'react';
import { ArcherBow, ArrowType } from '../types/game';
import { Modal } from './Modal';
import { ARCHER_BOWS, ARROW_SHOP } from '../services/WorldData';
import { fa } from '../engine/world';
import { Check, Lock, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  coins: number;
  equippedBowId: string;
  unlockedBows: string[];
  inventory: Record<ArrowType, number>;
  onClose: () => void;
  onEquipBow: (id: string) => void;
  onBuyBow: (bow: ArcherBow) => void;
  onBuyArrows: (type: ArrowType, cost: number, count: number) => void;
}

const Bar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => (
  <div className="flex items-center gap-2">
    <span className="w-16 text-[10px] text-slate-500 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-yellow-300" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

export const ArmoryModal: React.FC<Props> = ({
  isOpen, coins, equippedBowId, unlockedBows, inventory,
  onClose, onEquipBow, onBuyBow, onBuyArrows,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="زرادخانهٔ شکارچی"
    subtitle="کمان‌ها و تیرهای ویژه — سکه‌ها را با پاسخ‌های درست به دست می‌آوری."
    icon="🏹"
    accent="amber"
    size="lg"
    footer={
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">موجودی شما</span>
        <span className="flex items-center gap-1.5 text-lg font-black text-yellow-300">🪙 {fa(coins)}</span>
      </div>
    }
  >
    <div className="flex flex-col gap-6">
      {/* کمان‌ها */}
      <section>
        <h3 className="text-sm font-black text-slate-100 mb-3">کمان‌ها</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ARCHER_BOWS.map((b) => {
            const owned = unlockedBows.includes(b.id);
            const equipped = equippedBowId === b.id;
            const afford = coins >= b.price;
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition ${
                  equipped ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/40' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
                    style={{ borderColor: `${b.glowColor}66`, background: `${b.glowColor}18`, boxShadow: `0 0 18px ${b.glowColor}33` }}
                  >
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-100">{b.name}</h4>
                      {equipped && <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black">در دست</span>}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{b.description}</p>
                    <div className="mt-2 space-y-1">
                      <Bar label="سرعت تیر" value={b.arrowSpeed} max={1.8} />
                      <Bar label="سرعت کشش" value={b.drawSpeed} max={1.8} />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {equipped ? (
                    <div className="w-full py-2 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black text-center flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> در حال استفاده
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => onEquipBow(b.id)}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition active:scale-95"
                    >
                      برداشتن این کمان
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyBow(b)}
                      disabled={!afford}
                      className={`w-full py-2 rounded-xl text-xs font-black transition active:scale-95 flex items-center justify-center gap-1.5 ${
                        afford
                          ? 'bg-gradient-to-l from-amber-400 to-yellow-300 text-slate-950'
                          : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {afford ? <>🪙 خرید با {fa(b.price)} سکه</> : <><Lock className="w-3.5 h-3.5" /> {fa(b.price)} سکه لازم است</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* تیرها */}
      <section>
        <h3 className="text-sm font-black text-slate-100 mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> تیرهای ویژه
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">تیر ساده همیشه بی‌نهایت است؛ این‌ها فقط برای هیجان بیشترند.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ARROW_SHOP.map((a) => {
            const afford = coins >= a.price;
            return (
              <div key={a.type} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-slate-100">{a.name}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-black text-amber-300">
                      موجودی: {fa(inventory[a.type] ?? 0)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{a.desc}</p>
                  <button
                    onClick={() => onBuyArrows(a.type, a.price, a.count)}
                    disabled={!afford}
                    className={`mt-2.5 w-full py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                      afford
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    🪙 {fa(a.count)} عدد — {fa(a.price)} سکه
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  </Modal>
);
