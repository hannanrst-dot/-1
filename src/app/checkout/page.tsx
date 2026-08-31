import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata = { title: "تکمیل سفارش" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");

  const { coupon } = await searchParams;
  const addresses = await prisma.address.findMany({
    where: { userId: session.uid },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return <CheckoutView addresses={addresses} initialCoupon={coupon ?? ""} />;
}
