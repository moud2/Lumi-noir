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
};

export default function HomeMonolith() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id,title,price_cents,currency,cover_image_path")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (!mounted) return;
      setProducts((data || []) as ProductRow[]);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const featured = products.slice(0, 4);
  const heroImage = products[0]?.cover_image_path
    ? publicImageUrl(products[0].cover_image_path)
    : null;

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            {t("home.hero")}
          </h1>
          <p className="max-w-xl text-sm text-[var(--muted)]">{t("home.sub")}</p>
          <Link href="/shop" className="btn-primary inline-flex rounded-full px-6 py-3 text-sm font-semibold">
            {t("home.cta")}
          </Link>
        </div>
        <div className="rounded-[32px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="aspect-[3/4] overflow-hidden rounded-[28px] border border-[var(--line)] bg-white/5">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt="Hero" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                {t("home.hero.empty")}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("home.featured")}</h2>
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            {t("home.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featured.map((p) => {
              const img = publicImageUrl(p.cover_image_path);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
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
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        {t("home.about")}
      </section>

      <footer className="border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)]">
        {t("home.footer")}
      </footer>
    </div>
  );
}
