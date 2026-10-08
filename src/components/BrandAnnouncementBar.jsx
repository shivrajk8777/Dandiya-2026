"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Star, Award, ArrowRight, Flame } from "lucide-react";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";
import { subscribeToRegistrations } from "@/lib/registrationService";

export default function BrandAnnouncementBar({ onOpenRegister }) {
  const [inventoryConfig, setInventoryConfig] = useState({ maxTickets: 300, baseSoldTickets: 107 });
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const unsubInv = subscribeToInventoryConfig((inv) => setInventoryConfig(inv));
    const unsubReg = subscribeToRegistrations((list) => setRegistrations(list));

    return () => {
      if (typeof unsubInv === "function") unsubInv();
      if (typeof unsubReg === "function") unsubReg();
    };
  }, []);

  const stats = computeTicketStats(inventoryConfig, registrations);

  return (
    <aside aria-label="Official announcements" className="bg-[#120722] border-b border-[#e5b869]/20 text-[10px] sm:text-xs text-slate-300 py-1.5 sm:py-2 relative z-50 overflow-hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-6 gap-2">
        {/* Left marquee / highlight */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="font-bold tracking-wider uppercase text-amber-300 font-sans truncate flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {stats.isSoldOut
              ? `Passes Sold Out (${stats.soldPasses}/${stats.maxTickets})`
              : `Live: ${stats.soldPasses} Passes Sold • Only ${stats.remainingTickets} Available!`}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-400 font-light truncate">
            Rang Tarang Garba Mahotsav 2026 • Oct 17 • Raj Vilas Garden, Chomu
          </span>
        </div>

        {/* Right Actions & Accolades */}
        <div className="flex items-center gap-3 text-slate-400 text-[10px] sm:text-[11px] shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#e5b869] fill-[#e5b869]" />
            <span className="font-medium text-slate-200">4.9 / 5</span>
            <span className="text-slate-500 font-mono">({stats.soldPasses} Passes Booked)</span>
          </div>

          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-[#fef08a] hover:text-white font-black transition-all shrink-0 animate-pulse"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
            <span className="whitespace-nowrap font-black">
              {stats.isSoldOut ? "Check Status" : "Book Pass Now"}
            </span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}


