"use client";

import { useEffect, useState } from "react";
import { supabase, publicImageUrl } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function AdminHeroImagePage() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [heroPath, setHeroPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

      // Load current hero image path
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "hero_image")
        .eq("lang", "en")
        .maybeSingle();

      setHeroPath(data?.content || null);
    }

    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `site/hero/${Date.now()}-hero.${ext}`;

      // Delete old hero image from storage if exists
      if (heroPath) {
        await supabase.storage.from("product-images").remove([heroPath]);
      }

      // Upload new image
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file, { upsert: true });

      if (uploadErr) throw new Error(uploadErr.message);

      // Save path to site_content
      const { error: dbErr } = await supabase
        .from("site_content")
        .upsert(
          { key: "hero_image", lang: "en", content: storagePath },
          { onConflict: "key,lang" }
        );

      if (dbErr) throw new Error(dbErr.message);

      setHeroPath(storagePath);
      setMsg("Hero image uploaded successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setMsg(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    setMsg(null);

    try {
      // Remove from storage
      if (heroPath) {
        await supabase.storage.from("product-images").remove([heroPath]);
      }

      // Clear the database entry
      const { error: dbErr } = await supabase
        .from("site_content")
        .upsert(
          { key: "hero_image", lang: "en", content: "" },
          { onConflict: "key,lang" }
        );

      if (dbErr) throw new Error(dbErr.message);

      setHeroPath(null);
      setMsg("Hero image removed.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Remove failed";
      setMsg(message);
    } finally {
      setUploading(false);
    }
  }

  if (isAdmin === null) return null;

  if (isAdmin === false) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-semibold">{t("admin.only")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("admin.only.note")}</p>
      </div>
    );
  }

  const heroUrl = heroPath ? publicImageUrl(heroPath) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("admin.hero")}</h1>

      {/* Current hero image preview */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="mb-3 text-sm text-[var(--muted)]">{t("admin.hero.current")}</div>

        {heroUrl ? (
          <div className="space-y-4">
            <div className="aspect-[16/9] max-w-xl overflow-hidden rounded-lg border border-[var(--line)] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroUrl}
                alt="Hero"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              onClick={handleRemove}
              disabled={uploading}
            >
              {t("admin.hero.remove")}
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-black/50 p-8 text-center text-sm text-[var(--muted)]">
            {t("admin.hero.none")}
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="mb-3 text-sm text-[var(--muted)]">{t("admin.hero.upload")}</div>
        <label className="btn-primary inline-flex cursor-pointer rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
          {uploading ? "Uploading..." : t("admin.hero.upload")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {msg && (
        <div className="text-sm text-[var(--muted)]">{msg}</div>
      )}
    </div>
  );
}
