import React, { useState, useMemo, useRef } from 'react';
import { SpellingCategory, GradeLevel, SpellingItem } from '../types/game';
import { Modal } from './Modal';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { fa } from '../engine/world';
import { Plus, Trash2, Download, Upload, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';

const CATS: SpellingCategory[] = ['s_s_th', 'z_z_z_z', 't_t', 'gh_gh', 'h_h', 'khva', 'tanvin', 'gozar', 'peyvaste', 'all'];
const GRADES: GradeLevel[] = ['grade_1_2', 'grade_3_4', 'grade_5_6', 'middle_school', 'all'];

export const TeacherCustomWordsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [word, setWord] = useState('');
  const [bad, setBad] = useState('');
  const [key, setKey] = useState('');
  const [meaning, setMeaning] = useState('');
  const [rule, setRule] = useState('');
  const [sentence, setSentence] = useState('');
  const [cat, setCat] = useState<SpellingCategory>('s_s_th');
  const [grade, setGrade] = useState<GradeLevel>('grade_5_6');
  const [diff, setDiff] = useState<1 | 2 | 3>(2);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [customOnly, setCustomOnly] = useState(spellingContentAdapter.getCustomOnly());
  const [tick, setTick] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const custom = useMemo(
    () => (isOpen ? spellingContentAdapter.getCustomItems() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, tick]
  );

  const flash = (kind: 'ok' | 'err', text: string) => {
    setMsg({ kind, text });
    window.setTimeout(() => setMsg(null), 3500);
  };

  const variants = bad.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
  const canAdd = word.trim().length > 0 && variants.length > 0;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const w = word.trim();
    if (!w) return flash('err', 'واژه را وارد کن.');
    if (variants.length === 0) return flash('err', 'دست‌کم یک املای نادرست بنویس تا بازی بتواند گزینه بسازد.');
    if (variants.includes(w)) return flash('err', 'املای نادرست نباید با خودِ واژه یکی باشد.');
    if (key && !w.includes(key)) return flash('err', `حرف کلیدی «${key}» در واژهٔ «${w}» نیست.`);

    const partial: Partial<SpellingItem> = {
      word: w,
      correctSpelling: w,
      incorrectVariants: variants,
      missingLetter: key.trim() || undefined,
      meaning: meaning.trim() || 'واژهٔ درسی کلاس',
      ruleExplanation: rule.trim() || `املای درست این واژه «${w}» است.`,
      sentence: sentence.trim() || `«${w}» را در یک جمله به کار ببر.`,
      hint: meaning.trim() || 'واژهٔ درسی کلاس',
      category: cat,
      grade,
      difficulty: diff,
    };
    spellingContentAdapter.addCustomItem(partial);
    setTick((t) => t + 1);
    flash('ok', `واژهٔ «${w}» به بانک کلاس افزوده شد.`);
    setWord(''); setBad(''); setKey(''); setMeaning(''); setRule(''); setSentence('');
  };

  const exportJson = () => {
    const blob = new Blob([spellingContentAdapter.exportCustomItems()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-hunter-words-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (f: File) => {
    try {
      const n = spellingContentAdapter.importCustomItems(await f.text(), false);
      setTick((t) => t + 1);
      flash('ok', `${fa(n)} واژه از فایل افزوده شد.`);
    } catch (err) {
      flash('err', `خواندن فایل ناموفق بود: ${(err as Error).message}`);
    }
  };

  const field = 'w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition';
  const label = 'text-[11px] font-bold text-slate-400';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="واژه‌های معلم"
      subtitle="واژه‌های درس این هفته را اضافه کن تا دقیقاً همان‌ها در بازی بیایند."
      icon="📝"
      accent="indigo"
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {msg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${
            msg.kind === 'ok'
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/60 border-rose-700 text-rose-200'
          }`}>
            {msg.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        {/* فرم افزودن */}
        <form onSubmit={add} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" /> افزودن واژهٔ تازه
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={label}>املای درست *</span>
              <input className={field} value={word} onChange={(e) => setWord(e.target.value)} placeholder="مثلاً: مدرسه" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>املاهای نادرست * (با ویرگول)</span>
              <input className={field} value={bad} onChange={(e) => setBad(e.target.value)} placeholder="مدرثه، مدرصه" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className={label}>حرف چالشی (برای جای خالی)</span>
              <input
                className={field} value={key} maxLength={2}
                onChange={(e) => setKey(e.target.value)}
                placeholder="س"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>دسته</span>
              <select className={field} value={cat} onChange={(e) => setCat(e.target.value as SpellingCategory)}>
                {CATS.map((c) => (
                  <option key={c} value={c}>{spellingContentAdapter.getCategoryInfo(c).title}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>پایهٔ تحصیلی</span>
              <select className={field} value={grade} onChange={(e) => setGrade(e.target.value as GradeLevel)}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{spellingContentAdapter.getGradeDisplayName(g)}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={label}>معنی</span>
              <input className={field} value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="جای درس خواندن" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>نمونه در جمله</span>
              <input className={field} value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="هر روز به مدرسه می‌روم." />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className={label}>قاعدهٔ املایی (در بازی به دانش‌آموز نشان داده می‌شود)</span>
            <textarea className={`${field} resize-y`} rows={2} value={rule} onChange={(e) => setRule(e.target.value)} placeholder="«مدرسه» هم‌خانوادهٔ «درس» است، پس با «س» نوشته می‌شود." />
          </label>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className={label}>دشواری:</span>
              {[1, 2, 3].map((d) => (
                <button
                  key={d} type="button" onClick={() => setDiff(d as 1 | 2 | 3)}
                  className={`w-8 h-8 rounded-lg text-xs font-black border transition ${
                    diff === d ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {fa(d)}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!canAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> افزودن به بانک کلاس
            </button>
          </div>
        </form>

        {/* گزینه‌ها */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const v = !customOnly;
              spellingContentAdapter.setCustomOnly(v);
              setCustomOnly(v);
            }}
            disabled={custom.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition active:scale-95 disabled:opacity-40 ${
              customOnly ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            {customOnly ? '✓ فقط واژه‌های من در بازی' : 'فقط واژه‌های من در بازی'}
          </button>
          <button onClick={exportJson} disabled={custom.length === 0} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs font-bold hover:border-slate-600 transition active:scale-95 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> خروجی گرفتن
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs font-bold hover:border-slate-600 transition active:scale-95">
            <Upload className="w-3.5 h-3.5" /> وارد کردن فایل
          </button>
          <input
            ref={fileRef} type="file" accept="application/json,.json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }}
          />
          {custom.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('همهٔ واژه‌های افزودهٔ شما پاک شود؟')) {
                  spellingContentAdapter.clearCustomItems();
                  setTick((t) => t + 1);
                  flash('ok', 'بانک واژه‌های معلم پاک شد.');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" /> پاک کردن همه
            </button>
          )}
        </div>

        {customOnly && custom.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 leading-relaxed">
            الان بازی فقط از {fa(custom.length)} واژهٔ شما استفاده می‌کند. برای برگشتن به بانک کامل، همین گزینه را دوباره خاموش کن.
          </div>
        )}

        {/* فهرست واژه‌های معلم */}
        <div>
          <h3 className="text-sm font-black text-slate-100 mb-2">
            واژه‌های افزودهٔ شما ({fa(custom.length)})
          </h3>
          {custom.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500 leading-relaxed">
              هنوز واژه‌ای اضافه نکرده‌ای.<br />
              بازی همین حالا {fa(spellingContentAdapter.getBuiltInItems().length)} واژهٔ آماده دارد؛
              واژه‌های درس خودت را اینجا اضافه کن تا کنار آن‌ها بیاید.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {custom.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-base font-black text-emerald-300">{i.correctSpelling}</span>
                      {i.incorrectVariants.map((v) => (
                        <span key={v} className="text-xs text-rose-400/80 line-through">{v}</span>
                      ))}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">{i.ruleExplanation}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {spellingContentAdapter.getCategoryInfo(i.category).short}
                  </span>
                  <button
                    onClick={() => { spellingContentAdapter.removeCustomItem(i.id); setTick((t) => t + 1); }}
                    className="shrink-0 p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/60 text-slate-500 hover:text-rose-300 transition"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
