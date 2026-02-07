"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
      <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4">
        <span className="w-fit rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl">{t("hero.title")}</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">{t("hero.subtitle")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
            {t("hero.cta.primary")}
          </Link>
          <Link href="/about" className="btn-ghost rounded-full px-5 py-3 text-sm">
            {t("hero.cta.secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EmptyProducts({ show }: { show: boolean }) {
  const { t } = useLanguage();
  if (!show) return null;
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
      {t("empty.products")}
    </div>
  );
}
