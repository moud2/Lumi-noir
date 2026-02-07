"use client";

import { use, useEffect, useState } from "react";
import { supabase, publicImageUrl } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type ProductRow = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  is_published: boolean;
  cover_image_path: string | null;
};

type ProductImage = {
  id: string;
  path: string;
  sort_order: number | null;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved =
    typeof (params as any).then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,description,price_cents,currency,is_published,cover_image_path")
        .eq("id", resolved.id)
        .single();

      if (error) return setMsg(error.message);
      setProduct(data);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("id,path,sort_order")
        .eq("product_id", resolved.id)
        .order("sort_order", { ascending: true });
      setImages((imgs || []) as ProductImage[]);
    }
    load();
  }, [resolved.id]);

  async function save() {
    if (!product) return;
    setLoading(true);
    setMsg(null);
    try {
      const { error: updateErr } = await supabase
        .from("products")
        .update({
          title: product.title,
          description: product.description,
          price_cents: product.price_cents,
          currency: product.currency,
          is_published: product.is_published,
        })
        .eq("id", product.id);

      if (updateErr) throw new Error(updateErr.message);

      if (files && files.length > 0) {
        const uploadedPaths: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const path = `products/${product.id}/${Date.now()}-${f.name}`;
          const { error: upErr } = await supabase.storage
            .from("product-images")
            .upload(path, f, { upsert: false });

          if (upErr) throw new Error(upErr.message);
          uploadedPaths.push(path);
        }

        const { data: inserted, error: imgErr } = await supabase
          .from("product_images")
          .insert(
            uploadedPaths.map((path, idx) => ({
              product_id: product.id,
              path,
              sort_order: idx,
            }))
          )
          .select("id,path,sort_order");
        if (imgErr) throw new Error(imgErr.message);

        if (uploadedPaths[0]) {
          const { error: coverErr } = await supabase
            .from("products")
            .update({ cover_image_path: uploadedPaths[0] })
            .eq("id", product.id);
          if (coverErr) throw new Error(coverErr.message);
          setProduct((p) => (p ? { ...p, cover_image_path: uploadedPaths[0] } : p));
        }

        if (inserted) setImages((prev) => [...prev, ...(inserted as ProductImage[])]);
      }

      setMsg("Saved");
    } catch (e: any) {
      setMsg(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function setCover(path: string) {
    if (!product) return;
    setLoading(true);
    setMsg(null);
    const { error } = await supabase
      .from("products")
      .update({ cover_image_path: path })
      .eq("id", product.id);
    setLoading(false);
    if (error) return setMsg(error.message);
    setProduct((p) => (p ? { ...p, cover_image_path: path } : p));
  }

  async function removeImage(img: ProductImage) {
    if (!product) return;
    if (!confirm("Delete this image?")) return;
    setLoading(true);
    setMsg(null);
    const { error: delErr } = await supabase.from("product_images").delete().eq("id", img.id);
    if (delErr) {
      setLoading(false);
      return setMsg(delErr.message);
    }
    await supabase.storage.from("product-images").remove([img.path]);
    const remaining = images.filter((x) => x.id !== img.id);
    setImages(remaining);
    if (product.cover_image_path === img.path) {
      const nextCover = remaining[0]?.path || null;
      await supabase.from("products").update({ cover_image_path: nextCover }).eq("id", product.id);
      setProduct((p) => (p ? { ...p, cover_image_path: nextCover } : p));
    }
    setLoading(false);
  }

  async function removeProduct() {
    if (!product) return;
    if (!confirm("Delete this product?")) return;
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw new Error(error.message);
      router.push("/admin/products");
    } catch (e: any) {
      setMsg(e.message || "Delete failed");
      setLoading(false);
    }
  }

  const cover = publicImageUrl(product?.cover_image_path);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Edit product</h1>
        <button
          className="btn-ghost rounded-full px-4 py-2 text-sm"
          onClick={() => router.push("/admin/products")}
        >
          Back to list
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product?.title || "cover"} className="w-full rounded-xl" />
        ) : (
          <div className="aspect-[3/4] w-full rounded-xl bg-white/5" />
        )}
      </div>

      {images.length > 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="mb-3 text-sm text-[var(--muted)]">Images</div>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => {
              const src = publicImageUrl(img.path);
              const isCover = img.path === product?.cover_image_path;
              return (
                <div key={img.id} className="space-y-2">
                  <div className="h-24 w-16 overflow-hidden rounded-lg border border-[var(--line)] bg-white/5">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="product" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      className="btn-ghost rounded-full px-3 py-1 text-xs"
                      onClick={() => setCover(img.path)}
                      disabled={loading || isCover}
                    >
                      {isCover ? "Cover" : "Set cover"}
                    </button>
                    <button
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 disabled:opacity-50"
                      onClick={() => removeImage(img)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
        <input
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
          placeholder="Title"
          value={product?.title || ""}
          onChange={(e) => setProduct((p) => (p ? { ...p, title: e.target.value } : p))}
        />
        <textarea
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
          placeholder="Description"
          rows={6}
          value={product?.description || ""}
          onChange={(e) =>
            setProduct((p) => (p ? { ...p, description: e.target.value } : p))
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Price (e.g. 79.99)"
            value={product ? (product.price_cents / 100).toFixed(2) : ""}
            onChange={(e) => {
              const value = Math.round(Number(e.target.value) * 100);
              setProduct((p) => (p ? { ...p, price_cents: value } : p));
            }}
          />
          <input
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
            placeholder="Currency"
            value={product?.currency || "EUR"}
            onChange={(e) => setProduct((p) => (p ? { ...p, currency: e.target.value } : p))}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={product?.is_published || false}
            onChange={(e) =>
              setProduct((p) => (p ? { ...p, is_published: e.target.checked } : p))
            }
          />
          Published
        </label>

        <div className="space-y-2 text-sm text-[var(--muted)]">
          <div>Upload new photos:</div>
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="btn-primary rounded-full px-4 py-3 text-sm font-semibold disabled:opacity-50"
            onClick={save}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button
            className="rounded-full border border-red-500/40 bg-transparent px-4 py-3 text-sm text-red-200"
            onClick={removeProduct}
            disabled={loading}
          >
            Delete product
          </button>
        </div>

        {msg ? <div className="text-sm text-[var(--muted)]">{msg}</div> : null}
      </div>
    </div>
  );
}
