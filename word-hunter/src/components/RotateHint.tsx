import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * میدان بازی برای نمایشگرهای پهن (لپ‌تاپ، تخته هوشمند و ویدئوپروژکتور) طراحی شده است.
 * روی گوشیِ عمودی، به‌جای نمایش یک میدانِ بسیار کوچک، از کاربر می‌خواهیم گوشی را
 * افقی بگیرد.
 */
export const RotateHint: React.FC = () => {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const check = () =>
      setPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 820);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (!portrait) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 p-8 text-center bg-slate-950">
      <div className="animate-[wh-float_2.6s_ease-in-out_infinite]">
        <div className="w-24 h-40 rounded-3xl border-4 border-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,.35)]">
          <RotateCcw className="w-10 h-10 text-amber-400" />
        </div>
      </div>
      <h2 className="text-xl font-black text-amber-300">گوشی را افقی بگیر</h2>
      <p className="max-w-xs text-sm text-slate-400 leading-relaxed">
        میدان شکار برای صفحه‌های پهن ساخته شده است. با چرخاندن گوشی، کماندار و
        همهٔ واژه‌ها را بزرگ و کامل می‌بینی.
      </p>
    </div>
  );
};
