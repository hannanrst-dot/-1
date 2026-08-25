import React from 'react';
import { ArcherBow, ArrowType } from '../types/game';
import { ARCHER_BOWS } from '../services/WorldData';
import { audioService } from '../services/AudioService';
import { X, ShoppingBag, Check } from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  coins: number;
  equippedBowId: string;
  unlockedBows: string[];
  arrowInventory: Record<ArrowType, number>;
  onClose: () => void;
  onEquipBow: (bowId: string) => void;
  onBuyBow: (bow: ArcherBow) => void;
  onBuyArrows: (type: ArrowType, cost: number, count: number) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  coins,
  equippedBowId,
  unlockedBows,
  arrowInventory,
  onClose,
  onEquipBow,
  onBuyBow,
  onBuyArrows,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
              🏹
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">اسلحه‌خانه و ارتقای شکارچی</h2>
              <p className="text-xs text-slate-400">
                خرید و تجهیز کمان‌های کهن و تیرهای جادویی با سکه‌های کسب‌شده
              </p>
            </div>
          </div>

          {/* Current Gold Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/50 shadow-inner">
            <span className="text-base">🪙</span>
            <span className="text-base font-black text-amber-300">
              {coins.toLocaleString('fa-IR')} سکه
            </span>
          </div>
        </div>

        {/* Section 1: Bows */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <span>کمان‌های شکارچی:</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ARCHER_BOWS.map((bow) => {
              const isUnlocked = unlockedBows.includes(bow.id) || bow.isUnlocked;
              const isEquipped = equippedBowId === bow.id;
              const canAfford = coins >= bow.price;

              return (
                <div
                  key={bow.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isEquipped
                      ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-amber-500/10'
                      : isUnlocked
                      ? 'bg-slate-950/70 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-950/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${bow.glowColor}22`, border: `1px solid ${bow.glowColor}55` }}
                    >
                      {bow.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{bow.name}</h4>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                            مجهز شده
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {bow.description}
                      </p>
                    </div>
                  </div>

                  {/* Attributes & Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span>سرعت تیر: {bow.arrowSpeed}x</span>
                      <span>قدرت: {bow.powerMultiplier}x</span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          audioService.playCoin();
                          onEquipBow(bow.id);
                        }}
                        disabled={isEquipped}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isEquipped
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>فعال</span>
                          </>
                        ) : (
                          'تجهیز کمان'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            audioService.playCoin();
                            onBuyBow(bow);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{bow.price} سکه</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Special Arrows Ammo Shop */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <span>مهمات و تیرهای جادویی:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Fire Arrows */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-orange-500/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔥</span>
                  <span className="text-xs font-bold text-orange-400">
                    موجودی: {arrowInventory.fire}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-2">بسته تیر آتشین</h4>
                <p className="text-[11px] text-slate-400 mt-1">انفجار محیطی و خرد کردن اهداف</p>
              </div>

              <button
                onClick={() => {
                  if (coins >= 80) {
                    audioService.playCoin();
                    onBuyArrows('fire', 80, 5);
                  }
                }}
                disabled={coins < 80}
                className="w-full py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition disabled:opacity-40"
              >
                خرید ۵ تیر (۸۰ سکه)
              </button>
            </div>

            {/* Slow-mo Ice Arrows */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-sky-500/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">❄️</span>
                  <span className="text-xs font-bold text-sky-400">
                    موجودی: {arrowInventory.slow_mo}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-2">تیر بلورین آهسته</h4>
                <p className="text-[11px] text-slate-400 mt-1">حرکت روان و آهسته‌تر تیر</p>
              </div>

              <button
                onClick={() => {
                  if (coins >= 100) {
                    audioService.playCoin();
                    onBuyArrows('slow_mo', 100, 5);
                  }
                }}
                disabled={coins < 100}
                className="w-full py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-40"
              >
                خرید ۵ تیر (۱۰۰ سکه)
              </button>
            </div>

            {/* Multi-shot Arrows */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">✨</span>
                  <span className="text-xs font-bold text-purple-400">
                    موجودی: {arrowInventory.multi_shot}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-2">تیر سه‌گانه</h4>
                <p className="text-[11px] text-slate-400 mt-1">پرتاب همزمان ۳ تیر در یک شلیک</p>
              </div>

              <button
                onClick={() => {
                  if (coins >= 120) {
                    audioService.playCoin();
                    onBuyArrows('multi_shot', 120, 5);
                  }
                }}
                disabled={coins < 120}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-40"
              >
                خرید ۵ تیر (۱۲۰ سکه)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
