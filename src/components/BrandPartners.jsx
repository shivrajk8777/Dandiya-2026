"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Globe, ExternalLink } from "lucide-react";
import { subscribeToSponsors } from "@/lib/sponsorService";

export default function BrandPartners() {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToSponsors((data) => {
      setSponsors(data);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="border-y border-[#e5b869]/20 bg-[#090412]/80 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e5b869] shrink-0">
            <Sparkles className="w-4 h-4 text-[#e5b869]" />
            <span>Official Festival Partners</span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 sm:gap-9 text-slate-400">
            {sponsors.map((p) => {
              const Content = (
                <div className="text-center group cursor-pointer transition-transform hover:scale-105">
                  <div className="font-serif-royal font-bold text-sm sm:text-base text-slate-200 group-hover:text-[#e5b869] transition-colors tracking-wider flex items-center justify-center gap-1">
                    <span>{p.name}</span>
                    {p.website && (
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e5b869]" />
                    )}
                  </div>
                  <div className="text-[9px] text-[#e5b869]/80 tracking-wider uppercase font-medium mt-0.5">
                    {p.tier}
                  </div>
                  {p.tagline && (
                    <div className="text-[8px] text-slate-500 tracking-normal hidden md:block">
                      {p.tagline}
                    </div>
                  )}
                </div>
              );

              return p.website ? (
                <a
                  key={p.id || p.name}
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="outline-none"
                >
                  {Content}
                </a>
              ) : (
                <div key={p.id || p.name}>{Content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
