"use client";
import React from "react";
import { Sparkles, Star, Award, ArrowRight } from "lucide-react";

export default function BrandAnnouncementBar({ onOpenRegister }) {
  return (
    <aside aria-label="Official announcements" className="bg-[#120722] border-b border-[#e5b869]/20 text-[10px] sm:text-xs text-slate-300 py-1.5 sm:py-2 relative z-50 overflow-hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-6 gap-2">
        {/* Left marquee / highlight */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e5b869] animate-ping shrink-0" />
          <span className="font-semibold tracking-wider uppercase text-[#e5b869] font-sans truncate">
            Rang Tarang Garba 2026 Passes Live
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400 font-light truncate">
            India’s Premier Grand Heritage Rang Tarang Garba Mahotsav • Oct 17–19 • Raj Vilas Garden, Chomu
          </span>
        </div>

        {/* Right Actions & Accolades */}
        <div className="flex items-center gap-3 text-slate-400 text-[10px] sm:text-[11px] shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#e5b869] fill-[#e5b869]" />
            <span className="font-medium text-slate-200">4.9 / 5</span>
            <span className="text-slate-500">(12K+ Verified)</span>
          </div>

          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1 text-[#e5b869] hover:text-white font-semibold transition-colors shrink-0"
          >
            <span className="whitespace-nowrap">Book Early Bird</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}

