"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type Row = {
  lang: string;
  content: string;
};

export default function AboutContent() {
  const { lang, t } = useLanguage();
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase
        .from("site_content")
        .select("lang,content")
        .eq("key", "about");

      if (!mounted) return;
      if (error) return setContent(t("about.default"));

      const rows = (data as Row[]) || [];
      const match = rows.find((x) => x.lang === lang);
      const fallback = rows.find((x) => x.lang === "en");
      setContent(match?.content || fallback?.content || t("about.default"));
    }

    load();
    return () => {
      mounted = false;
    };
  }, [lang, t]);

  return <p className="mt-2 text-sm text-[var(--muted)] whitespace-pre-wrap">{content}</p>;
}
