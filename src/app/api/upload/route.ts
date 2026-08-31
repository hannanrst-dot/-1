import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "فایلی انتخاب نشده است" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: `فرمت ${file.type} پشتیبانی نمی‌شود` }, { status: 400 });
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: "حجم هر تصویر باید کمتر از ۵ مگابایت باشد" }, { status: 400 });
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
