"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function signup() {
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-sm space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
      <h1 className="text-2xl font-semibold">{t("signup.title")}</h1>
      <input
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-white/10"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="btn-primary w-full rounded-full px-4 py-3 text-sm font-semibold transition"
        onClick={signup}
      >
        {t("signup.button")}
      </button>
      {msg ? <div className="text-sm text-[var(--muted)]">{msg}</div> : null}
    </div>
  );
}
