import React, { useState } from 'react';
import { X, Users, Copy, Check, QrCode, Sparkles } from 'lucide-react';

interface ClassroomRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomRoomModal: React.FC<ClassroomRoomModalProps> = ({ isOpen, onClose }) => {
  const [roomCode] = useState<string>(() => `شکارچی-${Math.floor(100 + Math.random() * 900)}`);
  const [copied, setCopied] = useState(false);
  const [connectedStudents] = useState<string[]>([
    'آرش کمانگیر',
    'سارا کریمی',
    'امیررضا',
    'فاطمه نوروزی',
    'تیم عقاب طلایی',
    'گروه سیمرغ',
  ]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-teal-500/70 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-2xl">
            📡
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">اتاق تعاملی کلاس درس</h2>
            <p className="text-xs text-slate-400">
              بدون نیاز به ثبت‌نام یا رمز عبور؛ مناسب نمایش روی ویدئو پروژکتور
            </p>
          </div>
        </div>

        {/* Room Code Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-teal-950/40 border border-teal-500/40 flex flex-col items-center justify-center text-center gap-3">
          <span className="text-xs text-teal-400 font-bold">کد اتصال سریع اتاق کلاسی:</span>
          <div className="text-3xl lg:text-4xl font-black text-amber-300 tracking-wider bg-slate-900/80 px-6 py-2.5 rounded-2xl border border-amber-500/30">
            {roomCode}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کد کپی شد!' : 'کپی کد اتاق'}</span>
          </button>
        </div>

        {/* Live Classroom Roster */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>دانش‌آموزان و گروه‌های متصل در کلاس:</span>
            </span>
            <span className="text-teal-400 font-bold">{connectedStudents.length} شرکت‌کننده</span>
          </div>

          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-32 overflow-y-auto">
            {connectedStudents.map((st, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl text-xs bg-slate-900 border border-teal-500/30 text-teal-200 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{st}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
          <QrCode className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <span>
            معلم گرامی: می‌توانید این صفحه را مستقیماً روی ویدئو پروژکتور کلاس نمایش دهید و دانش‌آموزان به نوبت با کلیک، لمس تخته هوشمند یا گوشی پاسخ دهند.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition active:scale-98"
        >
          شروع جلسه کلاسی روی پروژکتور 🚀
        </button>
      </div>
    </div>
  );
};
