"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Plus, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export function ReviewForm({ productId, canReview }: { productId: string; canReview: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");
  const [busy, setBusy] = useState(false);

  if (!canReview) {
    return (
      <div className="rounded-xl bg-ink-50 p-4 text-center text-[13px] text-ink-600">
        برای ثبت دیدگاه ابتدا <a href="/login" className="link">وارد حساب کاربری</a> شوید.
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline w-full">
        <Plus className="size-4" /> ثبت دیدگاه شما
      </button>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, comment, pros, cons }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت دیدگاه", "error");
    toast("دیدگاه شما ثبت شد. با تشکر!");
    setOpen(false);
    setComment(""); setTitle(""); setPros([]); setCons([]);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-ink-200 p-4">
      <div>
        <label className="label">امتیاز شما</label>
        <div className="flex flex-row-reverse justify-end gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} ستاره`}>
              <Star className={`size-7 ${i <= rating ? "text-gold" : "text-ink-200"}`} fill="currentColor" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">عنوان دیدگاه (اختیاری)</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: کیفیت تصویر عالی" maxLength={80} />
      </div>

      <div>
        <label className="label">متن دیدگاه</label>
        <textarea
          className="input min-h-28 resize-y" value={comment} required minLength={5}
          onChange={(e) => setComment(e.target.value)}
          placeholder="تجربه خود از استفاده این محصول را بنویسید…"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TagInput label="نقاط قوت" color="emerald" items={pros} setItems={setPros} value={proInput} setValue={setProInput} />
        <TagInput label="نقاط ضعف" color="rose" items={cons} setItems={setCons} value={conInput} setValue={setConInput} />
      </div>

      <div className="flex gap-2">
        <button disabled={busy} className="btn-primary flex-1">{busy ? "در حال ثبت…" : "ثبت دیدگاه"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">انصراف</button>
      </div>
    </form>
  );
}

function TagInput({
  label, color, items, setItems, value, setValue,
}: {
  label: string; color: "emerald" | "rose"; items: string[];
  setItems: (v: string[]) => void; value: string; setValue: (v: string) => void;
}) {
  const add = () => {
    if (!value.trim()) return;
    setItems([...items, value.trim()]);
    setValue("");
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input" value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="بنویسید و Enter بزنید"
        />
        <button type="button" onClick={add} className="btn-outline px-3" aria-label="افزودن">
          <Plus className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span key={i} className={`badge bg-${color}-50 text-${color}-700`}>
            {t}
            <button type="button" onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label="حذف">
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
