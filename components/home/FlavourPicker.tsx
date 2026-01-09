"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Flavour } from "@/lib/flavours";
import { fetchActiveFlavours } from "@/lib/flavours";

const flavourStyles: Record<string, { ring: string; glow: string }> = {
  sweet: { ring: "ring-pink-400/40", glow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]" },
  fruity: { ring: "ring-orange-400/40", glow: "hover:shadow-[0_0_30px_rgba(251,146,60,0.25)]" },
  "ice-mint": { ring: "ring-cyan-400/40", glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]" },
  tobacco: { ring: "ring-amber-500/40", glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.20)]" },
  soda: { ring: "ring-violet-400/40", glow: "hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]" },
  berry: { ring: "ring-fuchsia-400/40", glow: "hover:shadow-[0_0_30px_rgba(217,70,239,0.25)]" },
  exotic: { ring: "ring-indigo-400/40", glow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]" },
};

export default function FlavourPicker() {
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlavours()
      .then((f) => setFlavours(f))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-semibold text-white/90">
          What flavour are you feeling today?
        </h2>
        <p className="mt-2 text-white/60">Loading flavours...</p>
      </section>
    );
  }

  if (!flavours.length) return null;

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white/90">
            What flavour are you feeling today?
          </h2>
          <p className="mt-2 text-white/60">
            Pick a vibe - we'll show you matching drops.</p>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex text-sm text-white/70 hover:text-white transition"
        >
          Browse all</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {flavours.map((f) => {
          const styles = flavourStyles[f.slug] || {
            ring: "ring-white/15",
            glow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.12)]",
          };

          return (
            <Link
              key={f.id}
              href={`/shop?flavour=${encodeURIComponent(f.slug)}`}
              className={[
                "group relative overflow-hidden rounded-2xl",
                "bg-white/[0.04] border border-white/10",
                "px-4 py-4 sm:py-5",
                "transition duration-300",
                "hover:bg-white/[0.06] hover:border-white/20",
                "ring-1",
                styles.ring,
                styles.glow,
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl bg-white/10" />
              </div>

              <div className="text-sm font-semibold text-white/90">{f.name}</div>
              <div className="mt-1 text-xs text-white/50">Tap to explore</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
