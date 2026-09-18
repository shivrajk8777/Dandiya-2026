"use client";
import React from "react";
import { Music2, UtensilsCrossed, Camera, Trophy, ShieldCheck, Car, Sparkles } from "lucide-react";

export default function Attractions() {
  const attractions = [
    {
      icon: Music2,
      title: "Celebrity DJ & Puneri Dhol",
      desc: "Feel the earth-shaking live percussion and high-energy EDM Dandiya fusion sets by top artists.",
      tag: "Live Beats",
      gradient: "from-amber-500/20 to-rose-500/20"
    },
    {
      icon: UtensilsCrossed,
      title: "Gujarati & Street Food Bazaar",
      desc: "Indulge in mouthwatering Jalebi-Fafda, spicy Chaat, Pav Bhaji, Kulfi, mocktails and sweet delicacies.",
      tag: "Food Mela",
      gradient: "from-rose-500/20 to-purple-500/20"
    },
    {
      icon: Camera,
      title: "360° Insta Photo Booths",
      desc: "Capture your vibrant Chaniya Cholis and ethnic royal attires at our curated selfie zones and 360 spin cams.",
      tag: "Selfie Spot",
      gradient: "from-purple-500/20 to-cyan-500/20"
    },
    {
      icon: Trophy,
      title: "₹50,000+ Grand Prize Pool",
      desc: "Trophies and cash rewards for Best Dressed Couple, Prince & Princess of Garba, and Best Energetic Squad.",
      tag: "Contests",
      gradient: "from-amber-500/20 to-emerald-500/20"
    },
    {
      icon: ShieldCheck,
      title: "Safe & Family Friendly",
      desc: "CCTV surveillance, female security guards, doctor on-call, and strictly verified entry passes.",
      tag: "100% Secure",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: Car,
      title: "Ample Valet Parking",
      desc: "Spacious dedicated 500+ car & two-wheeler parking area with hassle-free valet assistance.",
      tag: "Easy Access",
      gradient: "from-fuchsia-500/20 to-pink-500/20"
    }
  ];

  return (
    <section id="attractions" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Unmatched Festival Experience
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Key <span className="pink-gradient-text">Attractions & Highlights</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base">
            Not just dance – enjoy a full-scale festive carnival filled with music, food, prizes, and unforgettable memories!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="festive-card-glass rounded-2xl p-6 sm:p-7 relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
