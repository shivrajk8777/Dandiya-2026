"use client";
import React from "react";
import { Layers, Music2, Utensils, Crown, Sparkles, Shield, Compass, Star } from "lucide-react";

export default function RoyalExperience() {
  return (
    <section id="experience" className="py-24 relative bg-[#07030e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#160829] border border-[#e5b869]/30 text-xs font-semibold uppercase tracking-widest text-[#e5b869] mb-3">
            <Compass className="w-3.5 h-3.5" />
            The Production Standards
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif-royal">
            Curated For <span className="text-gold-gradient font-sans-modern font-black">Pure Splendor</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            Every technical and hospitality detail is engineered to provide an unparalleled festive environment for dancers and families.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/* Card 1: Large Span (40,000 sq.ft arena) */}
          <div className="md:col-span-2 lg:col-span-2 editorial-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#e5b869]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e5b869]/10 border border-[#e5b869]/30 flex items-center justify-center text-[#e5b869]">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-[#e5b869] uppercase tracking-wider bg-[#e5b869]/10 border border-[#e5b869]/20 px-3 py-1 rounded-full">
                  Infrastructure
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 font-serif-royal">
                40,000 Sq.Ft Hardwood Dance Arena
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
                Specially imported high-density, shock-absorbing wooden flooring designed to minimize knee fatigue and provide an effortless glide for continuous 6-hour Garba rounds.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="block text-slate-400 text-[10px] uppercase">Capacity</span>
                <strong className="text-white font-semibold">10,000 Dancers</strong>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px] uppercase">Surface</span>
                <strong className="text-[#e5b869] font-semibold">Anti-Skid Wood</strong>
              </div>
              <div>
                <span className="block text-slate-400 text-[10px] uppercase">Layout</span>
                <strong className="text-white font-semibold">Concentric Circles</strong>
              </div>
            </div>
          </div>

          {/* Card 2: L-Acoustics Sound */}
          <div className="editorial-card rounded-3xl p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#fb7185]">
                  <Music2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#fb7185] uppercase tracking-wider">
                  Audio
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-serif-royal">
                L-Acoustics Concert Audio
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                Zero distortion, acoustic-tuned line arrays designed specifically to capture the dynamic frequencies of live Indian percussion and crisp vocals.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-[#e5b869] font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>360° Surround Soundfield</span>
            </div>
          </div>

          {/* Card 3: Royal Cuisine */}
          <div className="editorial-card rounded-3xl p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                  Gastronomy
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-serif-royal">
                Kathiyawadi Food Bazaar
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                Over 40 curated culinary stalls featuring live Fafda-Jalebi counters, authentic Surti Undhiyu, gourmet Chaat, and chilled mocktail bars.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-300 font-medium">
              40+ Multi-Cuisine Counters
            </div>
          </div>

          {/* Card 4: VIP Canopy Suites */}
          <div className="editorial-card rounded-3xl p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-[#e5b869]/10 border border-[#e5b869]/30 flex items-center justify-center text-[#e5b869]">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#e5b869] uppercase tracking-wider">
                  VIP Cabana
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-serif-royal">
                Private Emperor Suites
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                Elevated air-conditioned lounges with private butler service, bespoke gourmet platters, and panoramic views of the main arena.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-[#e5b869] font-medium">
              Dedicated Butler & Valet Included
            </div>
          </div>

          {/* Card 5: Laser & Drone Aerial Show (Span 2 cols on tablet/desktop) */}
          <div className="md:col-span-2 lg:col-span-2 editorial-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#e5b869]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#e5b869] uppercase tracking-wider">
                  Visual Architecture
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 font-serif-royal">
                500-Drone Aerial Symphony & 3D Lasers
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light mb-4">
                Witness a breathtaking sky choreography of 500 synchronized illuminated drones forming sacred Navratri motifs above the open night sky, accompanied by synchronized 3D laser mapping.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Nightly at 11:30 PM</span>
              <span className="text-emerald-400 font-semibold">Special Highlight</span>
            </div>
          </div>

          {/* Card 6: Safety & Security */}
          <div className="editorial-card rounded-3xl p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Protocols
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-serif-royal">
                Z+ Security & Valet
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-light">
                500+ licensed personnel, dedicated female security marshals, doctor-on-call medical lounge, and 1,000+ vehicle valet parking.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-emerald-400 font-medium">
              100% Family Safe Environment
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
