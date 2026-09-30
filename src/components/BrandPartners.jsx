"use client";
import React from "react";
import { Sparkles } from "lucide-react";

// Static official festival partners list
export const STATIC_SPONSORS = [
  {
    id: "sp-1",
    name: "MAHAVEER AGRO",
    tier: "Industrial Partner",
    tagline: "Manufacturer & Exporter",
    website: "",
    logoUrl: "/sponsors/mahaveer-agro.png",
    bgWhite: true
  },
  {
    id: "sp-2",
    name: "AUDIO VIDEO EVENTS",
    tier: "Event Partner",
    tagline: "Creating Unforgettable Moments",
    website: "",
    logoUrl: "/sponsors/av.png"
  },
  {
    id: "sp-3",
    name: "SHREEJI SWEETS & BAKRES",
    tier: "Food Partner",
    tagline: "Sweets & Snacks",
    website: "",
    logoUrl: "/sponsors/shreeji-sweets-bakres.png",
    bgWhite: true
  },

  {
    id: "sp-4",
    name: "KAKA-KAJOD",
    tier: "Entertainment Partner",
    tagline: "Official Comedy & Media",
    website: "",
    logoUrl: "/sponsors/Kaka-Kajod.png",
  },
  {
    id: "sp-5",
    name: "JKM SOFTWARES",
    tier: "Technology Partner",
    tagline: "IT & Software Solutions",
    website: "",
    logoUrl: "/sponsors/JKM-Softwares.png",
    bgWhite: true
  },

  {
    id: "sp-6",
    name: "Raj Rox Creative Studio",
    tier: "Digital Partner",
    tagline: "Official Digital Partner",
    website: "",
    logoUrl: "/sponsors/Raj-Rox-Creative-Studio.png"
  },
  {
    id: "sp-7",
    name: "QUEEN PERFORMING ART",
    tier: "Cultural Partner",
    tagline: "Dance Company",
    website: "",
    logoUrl: "/sponsors/queen-performing-art-dance-company.png",
    bgWhite: true
  },
  {
    id: "sp-8",
    name: "Sharwan Dhol",
    tier: "Entertainment Partner",
    tagline: "Dhol",
    website: "",
    logoUrl: "/sponsors/Sharwan-Dhol.jpeg"
  },
  {
    id: "sp-9",
    name: "SK Jewellers and Sons",
    tier: "Jewellery Partner",
    tagline: "Gold & Silver",
    website: "",
    logoUrl: "/sponsors/SK-Jewellers-and-Sons.png"
  },
  {
    id: "sp-10",
    name: "Sonu Photography",
    tier: "Photography Partner",
    tagline: "Photography",
    website: "",
    logoUrl: "/sponsors/Sonu-Photography.jpeg"
  }
];

export default function BrandPartners() {
  // Duplicate array to form a 100% continuous, seamless infinite loop
  const marqueeSponsors = [
    ...STATIC_SPONSORS,
    ...STATIC_SPONSORS,
    ...STATIC_SPONSORS,
    ...STATIC_SPONSORS
  ];

  return (
    <section className="border-y border-[#e5b869]/20 bg-[#090412]/90 backdrop-blur-md py-4 sm:py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {/* Official Festival Partners Badge */}
          {/* <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e5b869] shrink-0 bg-[#140826] px-4 py-2.5 rounded-xl border border-[#e5b869]/40 shadow-lg shadow-[#e5b869]/5">
            <Sparkles className="w-4 h-4 text-[#e5b869] animate-pulse" />
            <span>Official Festival Partners</span>
          </div> */}

          {/* Marquee Continuous Non-Stop Infinite Slider */}
          <div className="flex-1 w-full overflow-hidden relative py-1">
            {/* Glass Fade Overlay Masks on Left & Right Edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#090412] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#090412] to-transparent z-10" />

            <div className="flex items-center gap-6 sm:gap-10 animate-marquee w-max">
              {marqueeSponsors.map((p, idx) => {
                const isWhiteBg = p.bgWhite || p.name?.toUpperCase().includes("JKM");
                const Content = (
                  <div className="text-center group cursor-pointer transition-transform hover:scale-105 flex flex-col items-center shrink-0 px-1.5">
                    <div
                      className={`h-12 sm:h-14 px-3.5 py-1.5 rounded-xl border shadow-md flex items-center justify-center transition-all ${isWhiteBg
                        ? "bg-white border-white group-hover:bg-slate-100"
                        : "bg-white/10 backdrop-blur-md border-white/20 group-hover:border-[#e5b869]/60 group-hover:bg-white/20"
                        }`}
                    >
                      <img
                        src={p.logoUrl}
                        alt={p.name}
                        className="h-full w-auto max-w-[140px] sm:max-w-[170px] object-contain drop-shadow-md transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#e5b869] tracking-wider uppercase font-bold mt-1.5">
                      {p.tier}
                    </div>
                    {p.tagline && (
                      <div className="text-[8px] text-slate-300 tracking-normal hidden lg:block mt-0.5 max-w-[140px] truncate font-medium">
                        {p.tagline}
                      </div>
                    )}
                  </div>
                );

                return p.website ? (
                  <a
                    key={`${p.id}-${idx}`}
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-none shrink-0"
                  >
                    {Content}
                  </a>
                ) : (
                  <div key={`${p.id}-${idx}`} className="shrink-0">
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
