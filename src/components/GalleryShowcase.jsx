"use client";
import React from "react";
import { Camera, Star, Sparkles, Quote } from "lucide-react";

export default function GalleryShowcase() {
  const highlights = [
    {
      title: "The Maha Raas Concentric Circles",
      caption: "5,000 dancers moving in rhythmic synchrony under 3D laser arches.",
      tag: "Main Arena",
      stat: "5,000+ Dancers"
    },
    {
      title: "Royal Chaniya Choli Couture",
      caption: "Vibrant traditional mirror-work and heirloom Gujarati ethnic couture.",
      tag: "Fashion Gala",
      stat: "Red Carpet"
    },
    {
      title: "100-Dhol Acoustic Resonance",
      caption: "Live acoustic percussion power vibrating the open night sky.",
      tag: "Live Percussion",
      stat: "100 Artists"
    },
    {
      title: "Gourmet Kathiyawadi Feasts",
      caption: "Live piping-hot Jalebi-Fafda, Surti sweets, and artisanal mocktails.",
      tag: "Food Village",
      stat: "40+ Counters"
    },
    {
      title: "VIP Backstage & Meet-and-Greet",
      caption: "Celebrity headliner interactions in the elevated AC lounge.",
      tag: "VIP Lounge",
      stat: "Exclusive"
    },
    {
      title: "Midnight Aerial Drone Symphony",
      caption: "500 synchronized drones forming illuminated Navratri motifs.",
      tag: "Midnight Finale",
      stat: "500 Drones"
    }
  ];

  return (
    <section id="gallery" className="py-24 relative bg-[#07030e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#160829] border border-[#e5b869]/30 text-[#e5b869] text-xs font-semibold uppercase tracking-widest mb-3">
            <Camera className="w-3.5 h-3.5" />
            Visual Splendor
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif-royal">
            The <span className="text-gold-gradient font-sans-modern font-black">Festival Atmosphere</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            A glimpse into the sheer energy, royal heritage attires, and electrifying celebration that defines Rang Tarang Garba.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="editorial-card rounded-3xl p-7 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold text-[#e5b869] bg-[#e5b869]/10 border border-[#e5b869]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {item.stat}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2.5 font-serif-royal group-hover:text-[#e5b869] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {item.caption}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[#e5b869]">
                  <Star className="w-3.5 h-3.5 fill-[#e5b869]" />
                  Archival Highlight
                </span>
                <span className="text-[11px] text-slate-500">Season 5 Retrospective</span>
              </div>
            </div>
          ))}
        </div>

        {/* Real Critic Review Quote Card */}
        <div className="mt-14 p-7 sm:p-9 rounded-3xl editorial-card max-w-4xl mx-auto text-center relative overflow-hidden">
          <Quote className="w-8 h-8 text-[#e5b869] mx-auto mb-3 opacity-80" />
          <p className="text-base sm:text-lg text-slate-200 font-light italic leading-relaxed max-w-2xl mx-auto">
            "The combination of the 40,000 sq.ft shock-absorbing wooden arena, the acoustic balance of the 100-piece live Dhol symphony, and the hospitality of the royal cabanas makes Rang Tarang Garba a cultural landmark for Indian festival productions."
          </p>
          <div className="mt-4 font-bold text-[#e5b869] text-sm font-serif-royal tracking-wide">
            — Times of India Lifestyle & Culture Review
          </div>
        </div>
      </div>
    </section>
  );
}
