import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// public URL for an image path stored in product-images bucket
export function publicImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // keep "/" working while encoding each segment
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/product-images/${safePath}`;
}

export function formatPrice(priceCents: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}
