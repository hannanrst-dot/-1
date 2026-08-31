"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export function QuestionForm({
  productId, questionId, loggedIn, placeholder,
}: {
  productId?: string; questionId?: string; loggedIn: boolean; placeholder: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loggedIn) {
    return (
      <p className="rounded-xl bg-ink-50 p-3 text-center text-[13px] text-ink-600">
        برای ثبت پرسش <a href="/login" className="link">وارد شوید</a>.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, questionId, body }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت", "error");
    setBody("");
    toast("پرسش شما ثبت شد");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="input" value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder} minLength={5} required
      />
      <button disabled={busy} className="btn-primary px-4" aria-label="ارسال">
        <Send className="size-4" />
      </button>
    </form>
  );
}
