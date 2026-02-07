"use client";

import { addToCart } from "@/lib/cart";

export default function AddToCartButton({
  item,
}: {
  item: {
    productId: string;
    title: string;
    priceCents: number;
    currency: string;
    coverImagePath?: string | null;
  };
}) {
  return (
    <button
      className="btn-primary w-full rounded-full px-4 py-3 text-sm font-semibold transition"
      onClick={() => addToCart(item, 1)}
    >
      Add to cart
    </button>
  );
}
