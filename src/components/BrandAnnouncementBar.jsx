"use client";
import React from "react";
import { Sparkles, Star, Award, ArrowRight } from "lucide-react";

export default function BrandAnnouncementBar({ onOpenRegister }) {
  return (
    <aside aria-label="Official announcements" className="bg-[#120722] border-b border-[#e5b869]/20 text-[11px] sm:text-xs text-slate-300 py-2 relative z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
        {/* Left marquee / highlight */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e5b869] animate-ping" />
          <span className="font-semibold tracking-wider uppercase text-[#e5b869] font-sans">
            Season 6 Passes Live
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400 font-light">
            India’s Premier Royal Heritage Dandiya & Garba Mahotsav • Oct 18–20
          </span>
        </div>

        {/* Right Actions & Accolades */}
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <div className="hidden sm:flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#e5b869] fill-[#e5b869]" />
            <span className="font-medium text-slate-200">4.9 / 5</span>
            <span className="text-slate-500">(12K+ Verified Attendees)</span>
          </div>

          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1 text-[#e5b869] hover:text-white font-semibold transition-colors"
          >
            <span>Book Early Bird</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
