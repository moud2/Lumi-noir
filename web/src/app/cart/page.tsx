"use client";

import Link from "next/link";
import { getCart, updateQty, removeItem } from "@/lib/cart";
import { formatPrice, publicImageUrl } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<ReturnType<typeof getCart>>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const total = items.reduce((sum, x) => sum + x.priceCents * x.quantity, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <div className="text-[var(--muted)]">{t("cart.empty")}</div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((x) => (
              <div
                key={x.productId}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white/5"
                      style={{ width: 56, height: 80 }}
                    >
                      {x.coverImagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={publicImageUrl(x.coverImagePath) || ""}
                          alt={x.title}
                          className="object-cover"
                          style={{ width: 56, height: 80, maxWidth: 56, maxHeight: 80 }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{x.title}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {formatPrice(x.priceCents, x.currency)}
                      </div>
                    </div>
                  </div>

                  <button
                    className="text-sm text-[var(--accent-strong)] hover:text-[var(--text)]"
                    onClick={() => {
                      removeItem(x.productId);
                      setItems(getCart());
                    }}
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="rounded-lg border border-[var(--line)] px-2 py-1 text-[var(--text)]"
                    onClick={() => {
                      updateQty(x.productId, x.quantity - 1);
                      setItems(getCart());
                    }}
                  >
                    -
                  </button>
                  <div className="w-10 text-center">{x.quantity}</div>
                  <button
                    className="rounded-lg border border-[var(--line)] px-2 py-1 text-[var(--text)]"
                    onClick={() => {
                      updateQty(x.productId, x.quantity + 1);
                      setItems(getCart());
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <div className="font-medium">Total</div>
              <div className="font-medium">{formatPrice(total, "EUR")}</div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary mt-3 block rounded-full px-4 py-3 text-center text-sm font-semibold transition"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
