import { CartView } from "@/components/cart/CartView";
import { getSession } from "@/lib/auth";

export const metadata = { title: "سبد خرید" };

export default async function CartPage() {
  const session = await getSession();
  return <CartView loggedIn={Boolean(session)} />;
}
