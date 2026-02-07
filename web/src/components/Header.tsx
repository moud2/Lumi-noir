"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearCart, getCart, setCartOwner } from "@/lib/cart";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const [count, setCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const refresh = () => setCount(getCart().reduce((a, b) => a + b.quantity, 0));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("lumi-cart-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("lumi-cart-changed", refresh);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email ?? null;
      if (!mounted) return;
      setUserEmail(email);
      setCartOwner(data.session?.user?.id || null);

      if (data.session?.user?.id) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();
        if (!mounted) return;
        setIsAdmin(!!adminRow);
      } else {
        setIsAdmin(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    clearCart();
    setCartOwner(null);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface-glass)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-3 py-3 md:flex-row md:items-center md:px-4 md:py-4">
        <Link href="/" className="text-base font-semibold tracking-[0.2em] md:text-lg">
          LUMI NOIR
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--muted)] shadow-[var(--shadow)] md:flex">
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/">
            {t("nav.home")}
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/shop">
            {t("nav.shop")}
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/sale">
            {t("nav.sale")}
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white" href="/about">
            {t("nav.about")}
          </Link>
        </nav>

        <div className="flex w-full flex-wrap items-center gap-2 text-xs md:w-auto md:text-sm">
          <select
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--muted)]"
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "fr" | "ar")}
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
          </select>
          <Link
            href="/cart"
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--muted)] transition hover:text-white"
          >
            {t("nav.cart")} ({count})
          </Link>

          {userEmail ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin/products"
                  className="rounded-full border border-[var(--line)] bg-white/10 px-4 py-2 text-white"
                >
                  {t("auth.admin")}
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-white"
                >
                  {t("auth.account")}
                </Link>
              )}
              <button
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--muted)] transition hover:text-white"
                onClick={logout}
              >
                {t("auth.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--muted)] transition hover:text-white"
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/signup"
                className="btn-primary rounded-full px-4 py-2 font-semibold"
              >
                {t("auth.signup")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
