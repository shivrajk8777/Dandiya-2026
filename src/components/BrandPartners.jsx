"use client";
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { subscribeToSponsors, generateDynamicLogoSvg } from "@/lib/sponsorService";

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

  // Duplicate sponsors array to form a 100% seamless infinite loop
  const marqueeSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="border-y border-[#e5b869]/20 bg-[#090412]/90 backdrop-blur-md py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {/* Badge Label */}
          {/* <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e5b869] shrink-0 bg-[#140826] px-3.5 py-2 rounded-xl border border-[#e5b869]/30 shadow-md">
            <Sparkles className="w-4 h-4 text-[#e5b869] animate-pulse" />
            <span>Official Festival Partners</span>
          </div> */}

          {/* Marquee Continuous Non-Stop Infinite Slider */}
          <div className="flex-1 w-full overflow-hidden relative py-1">
            {/* Glass Fade Overlay Masks on Left & Right Edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#090412] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#090412] to-transparent z-10" />

            <div className="flex items-center gap-8 sm:gap-12 animate-marquee w-max">
              {marqueeSponsors.map((p, idx) => {
                const logoSrc = p.logoUrl || generateDynamicLogoSvg(p.name, p.tier);
                const Content = (
                  <div className="text-center group cursor-pointer transition-transform hover:scale-105 flex flex-col items-center shrink-0 px-2">
                    <img
                      src={logoSrc}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = generateDynamicLogoSvg(p.name, p.tier);
                      }}
                      className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain drop-shadow-md transition-transform group-hover:scale-105"
                    />
                    <div className="text-[9px] sm:text-[10px] text-[#e5b869] tracking-wider uppercase font-bold mt-1">
                      {p.tier}
                    </div>
                    {p.tagline && (
                      <div className="text-[8px] text-slate-400 tracking-normal hidden lg:block mt-0.5 max-w-[140px] truncate">
                        {p.tagline}
                      </div>
                    )}
                  </div>
                );

                return p.website ? (
                  <a
                    key={`${p.id || p.name}-${idx}`}
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-none shrink-0"
                  >
                    {Content}
                  </a>
                ) : (
                  <div key={`${p.id || p.name}-${idx}`} className="shrink-0">
                    {Content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
