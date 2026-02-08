"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, publicImageUrl, formatPrice } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";
import HeroSection from "@/components/HeroSection";

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
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // Fetch all published products
      const { data: productData } = await supabase
        .from("products")
        .select("id,title,price_cents,currency,cover_image_path")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      setProducts((productData || []) as ProductRow[]);

      // Fetch hero image from site_content
      const { data: heroRow } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "hero_image")
        .eq("lang", "en")
        .maybeSingle();

      if (!mounted) return;
      const path = heroRow?.content || null;
      setHeroImageUrl(path ? publicImageUrl(path) : null);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Full-viewport editorial hero */}
      <HeroSection heroImageUrl={heroImageUrl} />

      {/* Product collection — scroll target */}
      <section id="collection" className="py-20 sm:py-28">
        {/* Section heading — editorial style */}
        <div className="mb-14 text-center">
          <h2 className="text-xs tracking-[0.3em] uppercase text-[var(--muted)]">
            {t("home.collection.heading")}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-white/20" />
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            {t("home.collection.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const img = publicImageUrl(p.cover_image_path);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="editorial-card group relative overflow-hidden bg-[var(--surface)] transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Image with 3D hover effect */}
                  <div className="aspect-[3/4] w-full overflow-hidden bg-white/5 transition-transform duration-500 group-hover:scale-[1.01]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                        {p.title}
                      </div>
                    )}
                  </div>

                  {/* Product info — editorial typography */}
                  <div className="p-4">
                    <div className="text-xs font-medium tracking-[0.12em] uppercase">
                      {p.title}
                    </div>
                    <div className="mt-1 text-xs tracking-[0.08em] text-[var(--muted)]">
                      {formatPrice(p.price_cents, p.currency)}
                    </div>
                  </div>

                  {/* Subtle bottom glow line for depth */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
