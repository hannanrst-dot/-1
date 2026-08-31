import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "اطلاعات حساب" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <ProfileForm
      user={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
    />
  );
}
