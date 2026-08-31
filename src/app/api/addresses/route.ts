import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addressSchema, zodMessage } from "@/lib/validators";
import { toEnDigits } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });
  const list = await prisma.address.findMany({
    where: { userId: session.uid },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse({
    ...raw,
    phone: toEnDigits(String(raw?.phone ?? "")),
    postalCode: toEnDigits(String(raw?.postalCode ?? "")),
  });
  if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });

  const count = await prisma.address.count({ where: { userId: session.uid } });
  const address = await prisma.address.create({
    data: { ...parsed.data, userId: session.uid, isDefault: count === 0 },
  });
  return NextResponse.json(address);
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await prisma.address.deleteMany({ where: { id, userId: session.uid } });
  return NextResponse.json({ ok: true });
}
