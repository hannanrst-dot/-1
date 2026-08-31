import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "نام باید حداقل ۳ حرف باشد").max(60),
  email: z.string().email("ایمیل معتبر نیست"),
  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد").max(64),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "ایمیل یا موبایل را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const sellerSchema = z.object({
  shopName: z.string().min(3, "نام فروشگاه حداقل ۳ حرف").max(60),
  description: z.string().max(600).optional().or(z.literal("")),
  nationalId: z.string().min(8, "کد ملی/شناسه صنفی معتبر نیست").max(20),
  iban: z.string().max(30).optional().or(z.literal("")),
  province: z.string().min(2, "استان را انتخاب کنید"),
  city: z.string().min(2, "شهر را وارد کنید"),
  address: z.string().min(10, "آدرس کامل را وارد کنید"),
});

export const productSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ حرف").max(160),
  description: z.string().min(20, "توضیحات حداقل ۲۰ حرف"),
  shortDesc: z.string().max(220).optional().or(z.literal("")),
  price: z.coerce.number().int().min(1000, "قیمت معتبر نیست"),
  discountPercent: z.coerce.number().int().min(0).max(90).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  brandId: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).min(1, "حداقل یک تصویر بارگذاری کنید"),
  specs: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).default([]),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
        colorHex: z.string().optional().nullable(),
        priceDiff: z.coerce.number().int().default(0),
        stock: z.coerce.number().int().min(0).default(0),
      })
    )
    .default([]),
  tags: z.string().max(200).optional().or(z.literal("")),
  warranty: z.string().max(120).optional().or(z.literal("")),
  warrantyMonths: z.coerce.number().int().min(0).max(120).default(12),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).default("NEW"),
  screenSize: z.string().max(30).optional().or(z.literal("")),
  hasMemory: z.coerce.boolean().default(false),
  panelType: z.string().max(40).optional().or(z.literal("")),
  unitCount: z.coerce.number().int().min(0).max(1000).optional(),
  wiring: z.string().max(40).optional().or(z.literal("")),
  isOriginal: z.coerce.boolean().default(true),
});

export const addressSchema = z.object({
  title: z.string().min(2).max(30).default("خانه"),
  receiverName: z.string().min(3, "نام تحویل‌گیرنده را وارد کنید").max(60),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  province: z.string().min(2, "استان را انتخاب کنید"),
  city: z.string().min(2, "شهر را وارد کنید"),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد"),
  line: z.string().min(10, "نشانی کامل را وارد کنید").max(300),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(80).optional().or(z.literal("")),
  comment: z.string().min(5, "متن دیدگاه حداقل ۵ حرف").max(1200),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
});

export function zodMessage(err: z.ZodError) {
  return err.issues[0]?.message ?? "اطلاعات ارسالی معتبر نیست";
}
