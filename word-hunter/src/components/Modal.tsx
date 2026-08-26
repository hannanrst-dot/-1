import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  accent?: string;          // مثلاً 'amber' | 'teal' | 'indigo'
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  projector?: boolean;
}

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

const ACCENTS: Record<string, { border: string; ring: string; text: string }> = {
  amber: { border: 'border-amber-500/70', ring: 'bg-amber-500/15 border-amber-500/40', text: 'text-amber-300' },
  teal: { border: 'border-teal-500/70', ring: 'bg-teal-500/15 border-teal-500/40', text: 'text-teal-300' },
  indigo: { border: 'border-indigo-500/70', ring: 'bg-indigo-500/15 border-indigo-500/40', text: 'text-indigo-300' },
  rose: { border: 'border-rose-500/70', ring: 'bg-rose-500/15 border-rose-500/40', text: 'text-rose-300' },
  slate: { border: 'border-slate-600', ring: 'bg-slate-700/40 border-slate-600', text: 'text-slate-200' },
  emerald: { border: 'border-emerald-500/70', ring: 'bg-emerald-500/15 border-emerald-500/40', text: 'text-emerald-300' },
};

export const Modal: React.FC<Props> = ({
  isOpen, onClose, title, subtitle, icon, accent = 'amber', size = 'md',
  children, footer, projector,
}) => {
  if (!isOpen) return null;
  const a = ACCENTS[accent] || ACCENTS.amber;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/88 backdrop-blur-md animate-[wh-fade_.18s_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className={`relative w-full ${SIZES[size]} max-h-[92dvh] flex flex-col rounded-3xl border-2 ${a.border} bg-slate-900 shadow-2xl animate-[wh-pop_.22s_cubic-bezier(.2,.9,.3,1.2)]`}
      >
        <header className="flex items-start gap-3 p-5 pb-4 border-b border-slate-800 shrink-0">
          <div className={`shrink-0 flex items-center justify-center rounded-2xl border ${a.ring} ${projector ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl'}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className={`font-black text-slate-50 ${projector ? 'text-2xl' : 'text-xl'}`}>{title}</h2>
            {subtitle && (
              <p className={`text-slate-400 mt-0.5 leading-relaxed ${projector ? 'text-sm' : 'text-xs'}`}>{subtitle}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && <div className="shrink-0 p-4 border-t border-slate-800">{footer}</div>}
      </div>
    </div>
  );
};

export const Stat: React.FC<{ label: string; value: React.ReactNode; icon?: string; tone?: string }> = ({
  label, value, icon, tone = 'text-slate-100',
}) => (
  <div className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
    {icon && <span className="text-lg leading-none">{icon}</span>}
    <span className="text-[10px] text-slate-500">{label}</span>
    <span className={`text-base font-black ${tone}`}>{value}</span>
  </div>
);
