"use client";

import { useLanguage } from "@/lib/i18n";

interface HeroSectionProps {
  heroImageUrl: string | null;
}

export default function HeroSection({ heroImageUrl }: HeroSectionProps) {
  const { t } = useLanguage();

  function scrollToCollection() {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero-breakout relative flex h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background image */}
      {heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}

      {/* Multi-layer gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      {/* Subtle vignette for 3D depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Brand name — huge editorial typography */}
        <h1
          className="text-5xl font-bold tracking-[0.3em] uppercase sm:text-7xl md:text-8xl lg:text-9xl"
          style={{
            textShadow:
              "0 2px 20px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3), 0 8px 80px rgba(0,0,0,0.2)",
          }}
        >
          LUMI NOIR
        </h1>

        {/* Thin editorial divider */}
        <div className="h-px w-16 bg-white/30" />

        {/* Tagline */}
        <p className="max-w-lg text-xs tracking-[0.2em] uppercase text-white/60 sm:text-sm">
          {t("home.editorial.tagline")}
        </p>

        {/* CTA button — editorial border style */}
        <button
          onClick={scrollToCollection}
          className="mt-6 border border-white/40 bg-transparent px-10 py-4 text-xs tracking-[0.3em] uppercase text-white transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          {t("home.editorial.cta")}
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="animate-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
