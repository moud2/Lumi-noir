"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type ContentMap = {
  en: string;
  fr: string;
  ar: string;
};

export default function AdminAboutContentPage() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [content, setContent] = useState<ContentMap>({ en: "", fr: "", ar: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const { data } = await supabase
        .from("site_content")
        .select("lang,content")
        .eq("key", "about");

      const map: ContentMap = { en: "", fr: "", ar: "" };
      (data || []).forEach((row: any) => {
        if (row.lang in map) map[row.lang as keyof ContentMap] = row.content || "";
      });
      setContent(map);
    }

    load();
  }, []);

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      const payload = [
        { key: "about", lang: "en", content: content.en },
        { key: "about", lang: "fr", content: content.fr },
        { key: "about", lang: "ar", content: content.ar },
      ];

      const { error } = await supabase
        .from("site_content")
        .upsert(payload, { onConflict: "key,lang" });

      if (error) throw new Error(error.message);
      setMsg("Saved");
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin === false) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-semibold">{t("admin.only")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("admin.only.note")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">About content</h1>
        <button
          className="btn-primary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
          onClick={save}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="mb-2 text-sm text-[var(--muted)]">English</div>
          <textarea
            className="h-56 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
            value={content.en}
            onChange={(e) => setContent((s) => ({ ...s, en: e.target.value }))}
          />
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="mb-2 text-sm text-[var(--muted)]">Français</div>
          <textarea
            className="h-56 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
            value={content.fr}
            onChange={(e) => setContent((s) => ({ ...s, fr: e.target.value }))}
          />
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="mb-2 text-sm text-[var(--muted)]">العربية</div>
          <textarea
            className="h-56 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
            value={content.ar}
            onChange={(e) => setContent((s) => ({ ...s, ar: e.target.value }))}
          />
        </div>
      </div>

      {msg ? <div className="text-sm text-[var(--muted)]">{msg}</div> : null}
    </div>
  );
}
