"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type ProductRow = {
  id: string;
  title: string;
  price_cents: number;
  currency: string;
  is_published: boolean;
  updated_at: string | null;
};

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!adminRow) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      const { data, error: loadErr } = await supabase
        .from("products")
        .select("id,title,price_cents,currency,is_published,updated_at")
        .order("created_at", { ascending: false });

      if (loadErr) return setError(loadErr.message);
      setProducts(data || []);
    }

    load();
  }, []);

  async function removeProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    setLoadingId(id);
    const { error: delErr } = await supabase.from("products").delete().eq("id", id);
    if (delErr) {
      setError(delErr.message);
      setLoadingId(null);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setLoadingId(null);
  }

  if (isAdmin === false) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-semibold">{t("admin.only")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("admin.only.note")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">{t("admin.products")}</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/content/hero"
              className="btn-ghost rounded-full px-4 py-2 text-sm"
            >
              {t("admin.hero")}
            </Link>
            <Link
              href="/admin/content/about"
              className="btn-ghost rounded-full px-4 py-2 text-sm"
            >
              Edit About
            </Link>
            <Link
              href="/admin/products/new"
              className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
            >
              {t("admin.add")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]"
          >
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-[var(--muted)]">
                {p.currency} {(p.price_cents / 100).toFixed(2)} ·{" "}
                {p.is_published ? "Published" : "Draft"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="btn-ghost rounded-full px-4 py-2 text-sm"
              >
                {t("admin.edit")}
              </Link>
              <button
                className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-200 disabled:opacity-50"
                onClick={() => removeProduct(p.id)}
                disabled={loadingId === p.id}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
