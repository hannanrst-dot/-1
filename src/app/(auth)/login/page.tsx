import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "ورود" };

export default async function LoginPage() {
  if (await getSession()) redirect("/account");
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
