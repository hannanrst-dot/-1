import { calculateSimilarity } from "../persian/utils";

export interface DatabaseProductSummary {
  id: number;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  stock: number;
  buyPrice: number;
  sellPrice: number;
  unit: string;
}

export interface ResolvedVoiceItem {
  requestedName: string;
  quantity: number;
  selectedProduct?: DatabaseProductSummary;
  matches: DatabaseProductSummary[];
  status: "EXACT" | "AMBIGUOUS" | "NOT_FOUND";
}

export interface VoiceResolutionResult {
  hasAmbiguity: boolean;
  needsConfirmation: boolean;
  promptText?: string;
  resolvedItems: ResolvedVoiceItem[];
}

/**
 * Resolves fuzzy voice items against database products list
 */
export function resolveVoiceInvoiceItems(
  voiceItems: { productName: string; quantity: number }[],
  allProducts: DatabaseProductSummary[]
): VoiceResolutionResult {
  const resolvedItems: ResolvedVoiceItem[] = [];
  let hasAmbiguity = false;
  let promptParts: string[] = [];

  for (const item of voiceItems) {
    const term = item.productName;
    const matches: { product: DatabaseProductSummary; score: number }[] = [];

    for (const prod of allProducts) {
      const score = calculateSimilarity(term, prod.name);
      if (score >= 0.4) {
        matches.push({ product: prod, score });
      }
    }

    // Sort matches descending by score
    matches.sort((a, b) => b.score - a.score);

    // اگر بهترین تطبیق مطمئن باشد (تطبیق کامل/تقریباً کامل ≈ ۸۰٪ به بالا)، بدون پرسش
    // همان انتخاب می‌شود. فقط وقتی واقعاً نامطمئن است سؤال می‌پرسیم.
    const top = matches[0];
    const second = matches[1];
    const confident = top && (top.score >= 0.8 || (top.score >= 0.6 && (!second || top.score - second.score >= 0.15)));

    if (confident) {
      resolvedItems.push({
        requestedName: term,
        quantity: item.quantity,
        selectedProduct: top.product,
        matches: matches.slice(0, 3).map(m => m.product),
        status: "EXACT",
      });
    } else if (matches.length > 0) {
      // Ambiguous multiple choices
      hasAmbiguity = true;
      const topCandidates = matches.slice(0, 4).map(m => m.product);
      resolvedItems.push({
        requestedName: term,
        quantity: item.quantity,
        selectedProduct: topCandidates[0], // pre-select best candidate
        matches: topCandidates,
        status: "AMBIGUOUS",
      });
      promptParts.push(
        `${topCandidates.length} محصول با عبارت "${term}" پیدا شد. آیا منظور شما ${topCandidates[0].name} است؟`
      );
    } else {
      // Not found in database
      hasAmbiguity = true;
      resolvedItems.push({
        requestedName: term,
        quantity: item.quantity,
        matches: [],
        status: "NOT_FOUND",
      });
      promptParts.push(`کالای "${term}" در دیتابیس یافت نشد.`);
    }
  }

  return {
    hasAmbiguity,
    needsConfirmation: true,
    promptText: promptParts.length > 0 ? promptParts.join(" ") : undefined,
    resolvedItems,
  };
}
