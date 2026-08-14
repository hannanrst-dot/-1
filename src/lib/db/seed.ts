import { db } from "@/db";
import { users, categories, brands, products, customers, suppliers, invoices, invoiceItems, expenses, settings } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  // Check if admin user already exists
  const existingUsers = await db.select().from(users).where(eq(users.username, "admin"));
  if (existingUsers.length > 0) {
    return { success: true, message: "دیتابیس قبلاً مقداردهی شده است." };
  }

  // Create Users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    passwordHash: hashedPassword,
    fullName: "مدیر فروشگاه",
    role: "admin",
    phone: "09123456789",
    status: "active",
  }).returning();

  const [sellerUser] = await db.insert(users).values({
    username: "seller",
    passwordHash: hashedPassword,
    fullName: "رضا محمدی (فروشنده)",
    role: "seller",
    phone: "09121112233",
    status: "active",
  }).returning();

  // Create Categories
  const [cat1] = await db.insert(categories).values({ name: "لوازم التحریر", code: "STAT", description: "دفتر، قلم، مداد و نوشت افزار" }).returning();
  const [cat2] = await db.insert(categories).values({ name: "تجهیزات اداری", code: "OFFICE", description: "کلاسر، زونکن، ماشین حساب" }).returning();
  const [cat3] = await db.insert(categories).values({ name: "مواد غذایی و سوپرمارکت", code: "FOOD", description: "خوراکی، نوشیدنی، تنقلات" }).returning();

  // Create Brands
  const [brand1] = await db.insert(brands).values({ name: "پاپکو (Papco)" }).returning();
  const [brand2] = await db.insert(brands).values({ name: "استدلر (Staedtler)" }).returning();
  const [brand3] = await db.insert(brands).values({ name: "فابر کاستل (Faber-Castell)" }).returning();
  const [brand4] = await db.insert(brands).values({ name: "میهن" }).returning();

  // Create Products
  const sampleProducts = [
    {
      name: "دفتر پاپکو ۸۰ برگ سیمی",
      sku: "PAP-80",
      barcode: "6260000111001",
      categoryId: cat1.id,
      brandId: brand1.id,
      unit: "عدد",
      stock: 45,
      minStock: 10,
      buyPrice: 45000,
      sellPrice: 65000,
      description: "دفتر ۸۰ برگ فنردار جلد سخت پاپکو",
      isActive: true,
    },
    {
      name: "دفتر پاپکو ۱۰۰ برگ کلاسور",
      sku: "PAP-100",
      barcode: "6260000111002",
      categoryId: cat1.id,
      brandId: brand1.id,
      unit: "عدد",
      stock: 30,
      minStock: 8,
      buyPrice: 85000,
      sellPrice: 120000,
      description: "دفتر ۱۰۰ برگ کلاسوری پاپکو",
      isActive: true,
    },
    {
      name: "مداد مشکی استدلر نوریس",
      sku: "STA-HB",
      barcode: "4007817104018",
      categoryId: cat1.id,
      brandId: brand2.id,
      unit: "عدد",
      stock: 4, // Low stock for alert demo
      minStock: 15,
      buyPrice: 18000,
      sellPrice: 28000,
      description: "مداد مشکی درجه یک استدلر آلمان",
      isActive: true,
    },
    {
      name: "مداد رنگی ۱۲ رنگ استدلر",
      sku: "STA-12",
      barcode: "4007817104124",
      categoryId: cat1.id,
      brandId: brand2.id,
      unit: "بسته",
      stock: 12,
      minStock: 5,
      buyPrice: 130000,
      sellPrice: 185000,
      description: "مداد رنگی ۱۲ تایی جعبه مقوایی استدلر",
      isActive: true,
    },
    {
      name: "پاک‌کن فابر کاستل کوچک",
      sku: "FAB-ERASER",
      barcode: "4005401871201",
      categoryId: cat1.id,
      brandId: brand3.id,
      unit: "عدد",
      stock: 3, // Low stock alert
      minStock: 10,
      buyPrice: 12000,
      sellPrice: 20000,
      description: "پاک‌کن عاری از مواد سمی فابر کاستل",
      isActive: true,
    },
    {
      name: "زونکن A4 پاپکو ۷ سانتی",
      sku: "PAP-ZON7",
      barcode: "6260000111003",
      categoryId: cat2.id,
      brandId: brand1.id,
      unit: "عدد",
      stock: 25,
      minStock: 5,
      buyPrice: 95000,
      sellPrice: 140000,
      description: "زونکن لب فلزی A4 کیفیت عالی",
      isActive: true,
    },
    {
      name: "خودکار بیک آبی ۱.۰ میلی‌متر",
      sku: "BIC-BLUE",
      barcode: "3086123456789",
      categoryId: cat1.id,
      brandId: brand2.id,
      unit: "عدد",
      stock: 120,
      minStock: 30,
      buyPrice: 6000,
      sellPrice: 10000,
      description: "خودکار اصلی بیک نوک کریستالی",
      isActive: true,
    },
    {
      name: "شیر کم چرب میهن ۱ لیتری",
      sku: "MIH-MILK1",
      barcode: "6260123456780",
      categoryId: cat3.id,
      brandId: brand4.id,
      unit: "عدد",
      stock: 18,
      minStock: 10,
      buyPrice: 28000,
      sellPrice: 35000,
      description: "شیر تازه کم چرب میهن",
      isActive: true,
    },
  ];

  const createdProducts = [];
  for (const p of sampleProducts) {
    const [prod] = await db.insert(products).values(p).returning();
    createdProducts.push(prod);
  }

  // Create Customers
  const [cust1] = await db.insert(customers).values({
    name: "علی رضایی",
    phone: "09121110099",
    address: "تهران، میدان ونک، خیابان ملاصدرا پلاک ۴",
    debt: 120000,
    totalPurchases: 650000,
    notes: "مشتری قدیمی - خرید اعتباری دارد",
  }).returning();

  const [cust2] = await db.insert(customers).values({
    name: "مریم حسینی",
    phone: "09123334455",
    address: "تهران، خیابان ولیعصر، برج آفتاب",
    debt: 0,
    totalPurchases: 450000,
    notes: "پرداخت همیشه نقدی",
  }).returning();

  // Create Suppliers
  const [supp1] = await db.insert(suppliers).values({
    name: "شرکت بازرگانی پاپکو",
    phone: "02188880000",
    company: "صنایع کاغذ پاپکو",
    address: "تهران، خیابان انقلاب، خیابان مطهری",
    debt: 4500000,
    totalPurchases: 25000000,
    notes: "تأمین‌کننده اصلی دفاتر و محصولات کاغذی",
  }).returning();

  // Create Sample Invoices
  const [inv1] = await db.insert(invoices).values({
    invoiceNumber: "INV-1001",
    customerId: cust1.id,
    customerName: cust1.name,
    totalAmount: 375000,
    discountAmount: 25000,
    taxAmount: 0,
    finalAmount: 350000,
    paidAmount: 230000,
    balance: 120000,
    paymentMethod: "split",
    status: "completed",
    createdById: adminUser.id,
    notes: "ثبت شده با دستیار صوتی",
  }).returning();

  await db.insert(invoiceItems).values([
    {
      invoiceId: inv1.id,
      productId: createdProducts[0].id,
      productName: createdProducts[0].name,
      unit: "عدد",
      quantity: 3,
      buyPrice: 45000,
      unitPrice: 65000,
      totalPrice: 195000,
    },
    {
      invoiceId: inv1.id,
      productId: createdProducts[3].id,
      productName: createdProducts[3].name,
      unit: "بسته",
      quantity: 1,
      buyPrice: 130000,
      unitPrice: 180000,
      totalPrice: 180000,
    },
  ]);

  // Expenses
  await db.insert(expenses).values({
    title: "قبض برق فروشگاه",
    category: "قبوض",
    amount: 320000,
    createdById: adminUser.id,
  });

  // Store Settings
  await db.insert(settings).values([
    {
      key: "store_info",
      value: {
        storeName: "فروشگاه مدرن پارس",
        phone: "02188776655",
        address: "تهران، خیابان آزادی، پلاک ۱۲",
        currency: "تومان",
        taxRate: 0,
        receiptHeader: "به فروشگاه مدرن پارس خوش آمدید",
        receiptFooter: "از خرید و اعتماد شما سپاسگزاریم - ارسال صوتی فاکتور فعال است",
      },
    },
  ]);

  return { success: true, message: "اطلاعات اولیه فروشگاه با موفقیت بارگذاری گردید." };
}
