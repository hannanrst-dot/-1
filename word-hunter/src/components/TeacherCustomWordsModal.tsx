import React, { useState } from 'react';
import { SpellingItem, SpellingCategory, GradeLevel } from '../types/game';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { X, Plus, Trash2, BookOpen, Check } from 'lucide-react';

interface TeacherCustomWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const TeacherCustomWordsModal: React.FC<TeacherCustomWordsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [word, setWord] = useState('');
  const [incorrectList, setIncorrectList] = useState('');
  const [incompleteForm, setIncompleteForm] = useState('');
  const [missingLetter, setMissingLetter] = useState('');
  const [meaning, setMeaning] = useState('');
  const [ruleExplanation, setRuleExplanation] = useState('');
  const [category, setCategory] = useState<SpellingCategory>('s_s_th');
  const [grade, setGrade] = useState<GradeLevel>('grade_3_4');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const allItems = spellingContentAdapter.getAllItems();
  const customItems = allItems.filter((i) => i.id.startsWith('custom_'));

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    const incorrectVariants = incorrectList
      .split(/[،,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newItem: Omit<SpellingItem, 'id'> = {
      word: word.trim(),
      correctSpelling: word.trim(),
      incorrectVariants: incorrectVariants.length > 0 ? incorrectVariants : [`${word.trim()} غلط`],
      incompleteForm: incompleteForm.trim() || undefined,
      missingLetter: missingLetter.trim() || undefined,
      meaning: meaning.trim() || 'واژه درسی کلاس',
      ruleExplanation: ruleExplanation.trim() || `املای استاندارد این واژه «${word.trim()}» است.`,
      category,
      grade,
      difficulty: 1,
      hint: meaning.trim() || 'واژه درسی',
    };

    spellingContentAdapter.addCustomItem(newItem);
    setSuccessMsg(`واژه «${word.trim()}» با موفقیت به بانک کلمات اضافه شد!`);
    setTimeout(() => setSuccessMsg(''), 3000);

    // Reset Form
    setWord('');
    setIncorrectList('');
    setIncompleteForm('');
    setMissingLetter('');
    setMeaning('');
    setRuleExplanation('');
    onRefreshData();
  };

  const handleDeleteItem = (id: string) => {
    spellingContentAdapter.removeCustomItem(id);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-indigo-500/70 rounded-3xl p-6 lg:p-8 shadow-2xl text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl">
            ✍️
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">بانک کلمات اختصاصی معلّم</h2>
            <p className="text-xs text-slate-400">
              واژه‌های املایی درس امروز کلاستان را بدون نیاز به ورود یا ثبت‌نام اضافه کنید
            </p>
          </div>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Add New Word */}
        <form onSubmit={handleAddWord} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-4">
          <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>افزودن واژه جدید به بازی:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Correct Word */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">املای صحیح کلمه *</label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="مثال: قطره، ظهر، غواص..."
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Incorrect Variants */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">
                غلط‌های املایی متداول (با ویرگول)
              </label>
              <input
                type="text"
                value={incorrectList}
                onChange={(e) => setIncorrectList(e.target.value)}
                placeholder="مثال: قتره، زهر، قواص"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">دسته‌بندی حروف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpellingCategory)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="s_s_th">س / ص / ث</option>
                <option value="z_z_z_z">ز / ض / ظ / ذ</option>
                <option value="t_t">ت / ط</option>
                <option value="gh_gh">غ / ق</option>
                <option value="h_h">ه / ح</option>
                <option value="khva">خوا / خا</option>
                <option value="tashdid">تشدید و تنوین</option>
              </select>
            </div>

            {/* Grade Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">پایه تحصیلی</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="grade_1_2">پایه اول و دوم دبستان</option>
                <option value="grade_3_4">پایه سوم و چهارم دبستان</option>
                <option value="grade_5_6">پایه پنجم و ششم دبستان</option>
                <option value="middle_school">دوره اول متوسطه</option>
              </select>
            </div>

            {/* Incomplete Form (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">فرم ناقص (برای حالت تیراندازی به حرف)</label>
              <input
                type="text"
                value={incompleteForm}
                onChange={(e) => setIncompleteForm(e.target.value)}
                placeholder="مثال: قـ _ ـر ه"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Missing Letter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">حرف گم‌شده</label>
              <input
                type="text"
                value={missingLetter}
                onChange={(e) => setMissingLetter(e.target.value)}
                placeholder="مثال: ط"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Meaning and Rule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">معنی کلمه یا جمله نمونه</label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="مثال: چکیدن قطرات زلال باران"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-medium">توضیح قاعده املایی</label>
              <input
                type="text"
                value={ruleExplanation}
                onChange={(e) => setRuleExplanation(e.target.value)}
                placeholder="مثال: این واژه با «ط» دسته‌دار نوشته می‌شود."
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-98"
          >
            افزودن این واژه به بازی
          </button>
        </form>

        {/* Existing Custom Words List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>کلمات سفارشی ثبت شده توسط شما ({customItems.length} واژه):</span>
            </span>
          </div>

          {customItems.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
              هنوز واژه سفارشی اضافه نکرده‌اید. بازی از بانک جامع داخلی استفاده می‌کند.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-300">{item.correctSpelling}</span>
                    <span className="text-[10px] text-slate-400 mr-2">
                      ({spellingContentAdapter.getCategoryDisplayName(item.category)})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 transition"
                    title="حذف واژه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
