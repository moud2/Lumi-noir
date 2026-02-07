"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, publicImageUrl, formatPrice } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type ProductRow = {
  id: string;
  title: string;
  price_cents: number;
  currency: string;
  cover_image_path: string | null;
  is_published?: boolean;
};

export default function ProductGrid({
  showEmpty = true,
}: {
  showEmpty?: boolean;
}) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (userId) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (!mounted) return;
        setIsAdmin(!!adminRow);
      } else {
        setIsAdmin(false);
      }

      const { data, error: loadErr } = await supabase
        .from("products")
        .select("id,title,price_cents,currency,cover_image_path,is_published")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (loadErr) return setError(loadErr.message);
      setProducts(data || []);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
        {error}
      </div>
    );
  }

  if (showEmpty && products.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        {t("empty.products")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => {
        const img = publicImageUrl(p.cover_image_path);
        return (
          <div key={p.id} className="relative">
            {isAdmin ? (
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="btn-ghost absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-xs"
              >
                {t("admin.edit")}
              </Link>
            ) : null}
            <Link
              href={`/product/${p.id}`}
              className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            >
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/5">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}
              </div>
              <div className="mt-3 text-sm font-semibold">{p.title}</div>
              <div className="text-sm text-[var(--muted)]">
                {formatPrice(p.price_cents, p.currency)}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
