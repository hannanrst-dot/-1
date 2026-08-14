import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth/session";
import { seedDatabase } from "@/lib/db/seed";

export async function POST(req: Request) {
  try {
    // Auto-seed if db is fresh
    await seedDatabase();

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "نام کاربری و رمز عبور الزامی است." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username.trim()));

    if (!user) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "حساب کاربری شما غیرفعال شده است." }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as "admin" | "seller" | "stockkeeper",
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "خطایی در ورود به سیستم رخ داد." }, { status: 500 });
  }
}
