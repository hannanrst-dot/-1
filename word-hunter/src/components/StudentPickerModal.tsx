import React, { useState } from 'react';
import { X, Users, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioService } from '../services/AudioService';

interface StudentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (name: string) => void;
}

const DEFAULT_STUDENTS = [
  'علی رضایی',
  'سارا محمدی',
  'امیرحسین کریمی',
  'فاطمه حسینی',
  'محمد پوریا',
  'نازنین زهرا',
  'آرشام کاظمی',
  'هلیا اکبری',
  'گروه سیمرغ',
  'گروه آرش کمانگیر',
];

export const StudentPickerModal: React.FC<StudentPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const [studentNames, setStudentNames] = useState<string[]>(DEFAULT_STUDENTS);
  const [inputText, setInputText] = useState<string>(DEFAULT_STUDENTS.join('، '));
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [chosenStudent, setChosenStudent] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateNames = (text: string) => {
    setInputText(text);
    const parsed = text
      .split(/[،,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setStudentNames(parsed.length > 0 ? parsed : DEFAULT_STUDENTS);
  };

  const handleSpinRoulette = () => {
    if (studentNames.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setChosenStudent(null);
    audioService.playTargetHit(true, 1);

    let counter = 0;
    const totalSteps = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * studentNames.length);
      setChosenStudent(studentNames[randomIdx]);
      counter++;

      if (counter >= totalSteps) {
        clearInterval(interval);
        const finalSelected = studentNames[Math.floor(Math.random() * studentNames.length)];
        setChosenStudent(finalSelected);
        setIsSpinning(false);
        audioService.playTargetHit(true, 5);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 90);
  };

  const handleConfirm = () => {
    if (chosenStudent) {
      onSelectStudent(chosenStudent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-teal-500/70 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
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
            🎯
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">گردونه انتخاب دانش‌آموز</h2>
            <p className="text-xs text-slate-400">
              انتخاب تصادفی دانش‌آموز یا گروه برای نشانه گرفتن هدف بعدی
            </p>
          </div>
        </div>

        {/* Roulette Display Wheel */}
        <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-teal-950/40 border border-teal-500/40 flex flex-col items-center justify-center text-center min-h-[160px]">
          <div className="text-xs text-teal-400 font-bold mb-2">نوبت پرتاب تیر با:</div>

          {chosenStudent ? (
            <div
              className={`text-2xl lg:text-3xl font-black text-amber-300 transition-transform ${
                isSpinning ? 'scale-110 opacity-75' : 'scale-100 animate-pulse'
              }`}
            >
              🏹 {chosenStudent}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              روی دکمه «چرخاندن گردونه» کلیک کنید...
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'در حال چرخش...' : 'چرخاندن گردونه 🎲'}</span>
          </button>
        </div>

        {/* Edit Student List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>فهرست اسامی دانش‌آموزان / گروه‌ها:</span>
            </span>
            <span className="text-teal-400 font-bold">{studentNames.length} نفر / گروه</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => handleUpdateNames(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition leading-relaxed resize-none"
            placeholder="اسامی را با ویرگول (،) از هم جدا کنید..."
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
        >
          تأیید و بازگشت به بازی
        </button>
      </div>
    </div>
  );
};
