import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { finalPrice } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { SHIPPING_METHODS } from "@/lib/utils";

type IncomingItem = { productId: string; variantId?: string | null; qty: number };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد حساب شوید" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];
  const addressId: string | undefined = body?.addressId;
  const shippingId: string = body?.shippingId ?? "POST";
  const couponCode: string | undefined = body?.couponCode?.trim() || undefined;
  const paymentMethod: string = body?.paymentMethod === "COD" ? "COD" : "ONLINE";
  const withInstallation: boolean = Boolean(body?.withInstallation);
  const note: string | undefined = body?.note?.slice(0, 400) || undefined;

  if (items.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  }

  const address = addressId
    ? await prisma.address.findFirst({ where: { id: addressId, userId: session.uid } })
    : null;
  if (!address) {
    return NextResponse.json({ error: "آدرس تحویل را انتخاب کنید" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, status: "APPROVED", isActive: true },
    include: { variants: true, seller: true },
  });

  let subtotal = 0;
  const orderItems: {
    productId: string; sellerId: string; title: string; image: string | null;
    variant: string | null; price: number; qty: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "یکی از کالاها دیگر موجود نیست" }, { status: 400 });
    }
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    const stock = variant ? variant.stock : product.stock;
    const qty = Math.max(1, Math.min(Number(item.qty) || 1, stock));
    if (stock < 1) {
      return NextResponse.json({ error: `«${product.title}» ناموجود شده است` }, { status: 400 });
    }

    // Price is always recomputed on the server — never trusted from the client.
    const unit = finalPrice(product.price + (variant?.priceDiff ?? 0), product.discountPercent);
    subtotal += unit * qty;

    orderItems.push({
      productId: product.id,
      sellerId: product.sellerId,
      title: product.title,
      image: JSON.parse(product.images || "[]")[0] ?? null,
      variant: variant ? `${variant.name}: ${variant.value}` : null,
      price: unit,
      qty,
    });
  }

  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minCart;
    if (valid && coupon) {
      discount = Math.floor((subtotal * coupon.percent) / 100);
      if (coupon.maxAmount > 0) discount = Math.min(discount, coupon.maxAmount);
      appliedCoupon = coupon.code;
    }
  }

  const shipping = SHIPPING_METHODS.find((s) => s.id === shippingId) ?? SHIPPING_METHODS[0];
  const shippingCost = subtotal >= SITE.freeShippingThreshold ? 0 : shipping.cost;
  const installationCost = withInstallation ? SITE.installationFee : 0;
  const total = subtotal - discount + shippingCost + installationCost;

  const code = `ORD-${Date.now().toString().slice(-8)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        code,
        userId: session.uid,
        addressId: address.id,
        subtotal,
        discount,
        shippingCost: shippingCost + installationCost,
        total,
        couponCode: appliedCoupon,
        paymentMethod,
        status: paymentMethod === "COD" ? "PROCESSING" : "PAID",
        paidAt: new Date(),
        note,
        addressSnap: JSON.stringify({
          receiverName: address.receiverName,
          phone: address.phone,
          province: address.province,
          city: address.city,
          postalCode: address.postalCode,
          line: address.line,
          shipping: shipping.label,
          installation: withInstallation,
        }),
        items: { create: orderItems },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty }, sold: { increment: item.qty } },
      });
    }
    if (appliedCoupon) {
      await tx.coupon.update({
        where: { code: appliedCoupon },
        data: { usedCount: { increment: 1 } },
      });
    }
    return created;
  });

  return NextResponse.json({ ok: true, code: order.code, id: order.id });
}
