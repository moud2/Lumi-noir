"use client";

import { useState } from "react";
import { clearCart, getCart } from "@/lib/cart";
import { useLanguage } from "@/lib/i18n";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ orderId: string } | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address_line1: "",
    city: "",
    zip: "",
    country: "Germany",
  });

  const items = getCart();

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, items }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      clearCart();
      setDone({ orderId: data.orderId });
    } catch (e: any) {
      alert(e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
        <div className="text-2xl font-semibold">{t("order.placed")}</div>
        <div className="mt-2 text-[var(--muted)]">
          {t("order.id")}: {done.orderId}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{t("checkout.title")}</h1>

      {items.length === 0 ? (
        <div className="text-[var(--muted)]">{t("cart.empty")}</div>
      ) : (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3 shadow-[var(--shadow)]">
          {Object.entries(form).map(([k, v]) => (
            <input
              key={k}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder={k.replaceAll("_", " ")}
              value={v}
              onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
            />
          ))}

          <button
            className="btn-primary w-full rounded-full px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
            onClick={submit}
            disabled={loading}
          >
            {loading ? t("checkout.placing") : t("checkout.place")}
          </button>

          <div className="text-xs text-[var(--muted)]">{t("checkout.note")}</div>
        </div>
      )}
    </div>
  );
}
