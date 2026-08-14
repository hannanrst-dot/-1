import { cookies } from "next/headers";

export interface UserSession {
  id: number;
  username: string;
  fullName: string;
  role: "admin" | "seller" | "stockkeeper";
}

const SESSION_COOKIE_NAME = "store_session";

export async function setSessionCookie(user: UserSession) {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie || !cookie.value) return null;
    const jsonStr = Buffer.from(cookie.value, "base64").toString("utf-8");
    return JSON.parse(jsonStr) as UserSession;
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
