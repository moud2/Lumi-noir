"use client";

import { use, useEffect, useState } from "react";
import AddToCartButton from "./ui";
import { supabase, publicImageUrl, formatPrice } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type ProductRow = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  cover_image_path: string | null;
};

type ProductImage = {
  path: string;
  sort_order: number | null;
};

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = typeof (params as any).then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [related, setRelated] = useState<ProductRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const { data, error: loadErr } = await supabase
        .from("products")
        .select("id,title,description,price_cents,currency,cover_image_path")
        .eq("id", resolved.id)
        .single();

      if (loadErr) return setError(loadErr.message);
      setProduct(data);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("path,sort_order")
        .eq("product_id", resolved.id)
        .order("sort_order", { ascending: true });

      const list = (imgs || []) as ProductImage[];
      const cover = data.cover_image_path;
      const withCover =
        cover && !list.find((x) => x.path === cover)
          ? [{ path: cover, sort_order: -1 }, ...list]
          : list;
      setImages(withCover);
      const first = cover || withCover[0]?.path || null;
      setActiveImage(first);
      const idx = first ? withCover.findIndex((x) => x.path === first) : 0;
      setActiveIndex(idx >= 0 ? idx : 0);

      const { data: rel } = await supabase
        .from("products")
        .select("id,title,price_cents,currency,cover_image_path")
        .neq("id", resolved.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      setRelated((rel || []) as ProductRow[]);
    }

    load();
  }, [resolved.id]);

  if (error) return <div>Product not found.</div>;
  if (!product) return <div>Loading...</div>;

  const img = publicImageUrl(activeImage || product.cover_image_path);
  const total = images.length;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--line)] bg-white/5">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={product.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
          {total > 1 ? (
            <div className="flex items-center justify-between">
              <button
                className="btn-ghost rounded-full px-4 py-2 text-sm"
                onClick={() => {
                  const next = (activeIndex - 1 + total) % total;
                  setActiveIndex(next);
                  setActiveImage(images[next]?.path || null);
                }}
              >
                Prev
              </button>
              <div className="text-xs text-[var(--muted)]">
                {activeIndex + 1} / {total}
              </div>
              <button
                className="btn-ghost rounded-full px-4 py-2 text-sm"
                onClick={() => {
                  const next = (activeIndex + 1) % total;
                  setActiveIndex(next);
                  setActiveImage(images[next]?.path || null);
                }}
              >
                Next
              </button>
            </div>
          ) : null}
          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {images.map((x, i) => {
                const src = publicImageUrl(x.path);
                const isActive = x.path === activeImage;
                return (
                  <button
                    key={`${x.path}-${i}`}
                    className={`h-16 w-12 overflow-hidden rounded-lg border ${
                      isActive ? "border-white" : "border-[var(--line)]"
                    } bg-white/5`}
                    onClick={() => {
                      setActiveImage(x.path);
                      setActiveIndex(i);
                    }}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={product.title} className="h-full w-full object-cover" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <div className="text-lg text-[var(--muted)]">
            {formatPrice(product.price_cents, product.currency)}
          </div>
          <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{product.description}</p>

          <AddToCartButton
            item={{
              productId: product.id,
              title: product.title,
              priceCents: product.price_cents,
              currency: product.currency,
              coverImagePath: product.cover_image_path,
            }}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("related.title")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => {
              const rimg = publicImageUrl(p.cover_image_path);
              return (
                <a
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/5">
                    {rimg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rimg}
                        alt={p.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                  <div className="mt-3 text-sm font-semibold">{p.title}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {formatPrice(p.price_cents, p.currency)}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
