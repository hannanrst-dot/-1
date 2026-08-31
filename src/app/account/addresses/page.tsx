import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AddressManager } from "@/components/account/AddressManager";

export const metadata = { title: "آدرس‌های من" };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });
  return <AddressManager initial={addresses} />;
}
