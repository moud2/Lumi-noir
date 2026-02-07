"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "79.99",
    is_published: true,
  });

  const [files, setFiles] = useState<FileList | null>(null);

  async function submit() {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not logged in");

      // insert product
      const priceCents = Math.round(Number(form.price) * 100);

      const { data: product, error: pErr } = await supabase
        .from("products")
        .insert({
          title: form.title,
          description: form.description,
          price_cents: priceCents,
          currency: "EUR",
          is_published: form.is_published,
        })
        .select("id")
        .single();

      if (pErr || !product) throw new Error(pErr?.message || "Failed to create product");

      // upload images (optional)
      const uploadedPaths: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const path = `products/${product.id}/${Date.now()}-${f.name}`;
          const { error: upErr } = await supabase.storage
            .from("product-images")
            .upload(path, f, { upsert: false });

          if (upErr) throw new Error(upErr.message);
          uploadedPaths.push(path);
        }

        // save image rows
        const { error: imgErr } = await supabase.from("product_images").insert(
          uploadedPaths.map((path, idx) => ({
            product_id: product.id,
            path,
            sort_order: idx,
          }))
        );
        if (imgErr) throw new Error(imgErr.message);

        // set cover image to first
        const { error: coverErr } = await supabase
          .from("products")
          .update({ cover_image_path: uploadedPaths[0] })
          .eq("id", product.id);

        if (coverErr) throw new Error(coverErr.message);
      }

      alert("Product created ✅");
      router.push("/");
    } catch (e: any) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
      <h1 className="text-2xl font-semibold">Add Product</h1>

      <input
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
      />
      <textarea
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Description"
        rows={5}
        value={form.description}
        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
      />
      <input
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Price (e.g. 79.99)"
        value={form.price}
        onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((s) => ({ ...s, is_published: e.target.checked }))} />
        Publish immediately
      </label>

      <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />

      <button
        className="btn-primary w-full rounded-full px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Create"}
      </button>
    </div>
  );
}
