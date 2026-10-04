"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, MapPin, Clock, Ticket, Search, ShieldCheck, ArrowRight, Star, Flame, TrendingUp } from "lucide-react";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";
import { subscribeToRegistrations } from "@/lib/registrationService";

export default function Hero({ onOpenRegister, onOpenLookup }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19
  });
  const [inventoryConfig, setInventoryConfig] = useState({ maxTickets: 300 });
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

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 17);
    targetDate.setHours(19, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <section className="relative min-h-[85vh] pt-12 sm:pt-20 pb-16 sm:pb-24 flex items-center justify-center overflow-hidden bg-grid-subtle">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-[#3b0d61]/25 via-[#e11d48]/15 to-[#e5b869]/20 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center z-10 w-full">
        {/* Logo Badge Display */}
        <div className="flex justify-center mb-6">
          <div className="relative group inline-block">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#e5b869] via-orange-500 to-[#e11d48] rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
            <div className="relative px-5 py-3.5 bg-[#0d041c]/90 border border-[#e5b869]/50 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-2xl">
              <img
                src="/rang-tarang-logo.png"
                alt="Rang Tarang Garba"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.7)]"
              />
              <div className="text-left">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#e5b869] block font-sans">
                  Official Navratri Mahotsav
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-serif-royal block leading-tight">
                  RANG TARANG <span className="text-gold-gradient font-sans-modern font-black">GARBA</span>
                </span>
                <span className="text-[10px] text-slate-300 font-medium tracking-wider">
                  Season 1 • Chomu, Rajasthan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top festival badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#160829] border border-[#e5b869]/30 mb-6 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#e5b869]" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#e5b869] font-sans">
            1th Annual Grand Garba Mahotsav
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
            October 17-10-2026
          </span>
        </div>

        {/* Hindi Sanskrit Inscription */}
        <div className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#e5b869]/90 uppercase font-serif-royal mb-3">
          ॥ अखंड आनंद, राजसी गरबा एवं डांडिया रास ॥
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.08] mb-6 font-serif-royal break-words">
          <span className="text-white">RANG TARANG </span>
          <br />
          <span className="text-gold-gradient font-sans-modern font-black">
            GARBA 2026
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-slate-300 font-light mb-8 leading-relaxed px-2">
          Experience Rajasthan’s most prestigious and electric Rang Tarang Garba festival at Raj Vilas Garden, Chomu. 3 grand evenings with 100-piece live Dhol symphony, celebrity headliners, 40,000 sq.ft wooden arena, and royal dining.
        </p>

        {/* Event Meta Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-10 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl editorial-card text-[11px] sm:text-xs">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e5b869] shrink-0" />
            <span className="font-medium whitespace-nowrap">17 Oct 2026</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl editorial-card text-[11px] sm:text-xs">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fb7185] shrink-0" />
            <span className="font-medium whitespace-nowrap">07:00 PM to 01:00 AM</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl editorial-card text-[11px] sm:text-xs">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
            <span className="font-medium text-left">Raj Vilas Garden, Chomu, Rajasthan</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => onOpenRegister()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#c9933b] hover:from-white hover:to-[#e5b869] text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 sm:gap-2.5 group hover:scale-[1.02] active:scale-95 transition-all animate-pass-blink"
          >
            <Ticket className="w-4 h-4 text-black shrink-0 animate-bounce" />
            <span className="font-black">Book Official Passes</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1.5 transition-transform shrink-0" />
          </button>

          <button
            onClick={onOpenLookup}
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 bg-[#140826] hover:bg-[#1a0b33] border border-[#e5b869]/30 hover:border-[#e5b869] text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-[#e5b869] shrink-0" />
            <span>Retrieve Existing Pass</span>
          </button>
        </div>

        {/* Live Real-Time Ticket Inventory & Sales Progress Card */}
        <div className="max-w-xl mx-auto mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#1c0830]/90 via-[#130524]/95 to-[#0b0314]/95 border border-amber-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle glowing radial background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider text-amber-300 text-[11px] sm:text-xs font-serif-royal">
                ⚡ Live Ticket Booking & Stock Status
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                stats.isSoldOut 
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}>
                {stats.isSoldOut ? "Sold Out" : `${stats.soldPercentage}% Passes Booked`}
              </span>
            </div>
          </div>

          {/* 3 Metric Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center mb-3.5">
            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Total Capacity
              </span>
              <span className="text-base sm:text-2xl font-black text-white font-sans">
                {stats.maxTickets}
              </span>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Passes Sold
              </span>
              <span className="text-base sm:text-2xl font-black text-amber-400 font-sans">
                {stats.soldPasses}
              </span>
            </div>
            <div className={`p-2 sm:p-3 rounded-2xl border ${
              stats.isSoldOut 
                ? "bg-rose-500/15 border-rose-500/30 text-rose-300" 
                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
            }`}>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold block mb-0.5">
                Available Left
              </span>
              <span className={`text-base sm:text-2xl font-black font-sans ${stats.isSoldOut ? "text-rose-400" : "text-emerald-400"}`}>
                {stats.remainingTickets}
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-black/60 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-700 relative"
                style={{ width: `${Math.max(4, Math.min(100, stats.soldPercentage))}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <strong className="text-white font-mono">{stats.remainingTickets}</strong> Couple Passes Available
              </span>
              <span className="text-slate-300">
                <strong className="text-amber-300 font-mono">{stats.soldPasses}</strong> Sold ({stats.soldPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Live Glass Countdown Timer */}
        <div className="max-w-xl mx-auto p-4 sm:p-6 rounded-3xl editorial-card relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-white/10">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-[#e5b869] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#e5b869] shrink-0" />
              Gates Open In
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-medium">
              Early-Bird Available
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-3.5 text-center">
            <div className="bg-[#0b0314] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
              <div className="text-xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[9px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-0.5 sm:mt-1">
                Days
              </div>
            </div>
            <div className="bg-[#0b0314] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
              <div className="text-xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[9px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-0.5 sm:mt-1">
                Hours
              </div>
            </div>
            <div className="bg-[#0b0314] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
              <div className="text-xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[9px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-0.5 sm:mt-1">
                Mins
              </div>
            </div>
            <div className="bg-[#0b0314] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
              <div className="text-xl sm:text-4xl font-black text-[#e5b869] font-sans">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[9px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-0.5 sm:mt-1">
                Secs
              </div>
            </div>
          </div>
        </div>

        {/* Live Festival Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-8 sm:mt-10 max-w-4xl mx-auto text-left">
          <div className="p-3 sm:p-4 rounded-2xl editorial-card flex items-center gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg text-[#e5b869] font-black shrink-0">2K+</div>
            <div className="text-[11px] sm:text-xs text-slate-300">
              <strong className="block text-white font-semibold">Attendees</strong>
              Open Arena
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl editorial-card flex items-center gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg text-[#fb7185] font-black shrink-0">100</div>
            <div className="text-[11px] sm:text-xs text-slate-300">
              <strong className="block text-white font-semibold">Dhol Symphony</strong>
              Live Percussion
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl editorial-card flex items-center gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg text-emerald-400 font-black shrink-0">
              {stats.remainingTickets}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-300">
              <strong className="block text-white font-semibold">Passes Available</strong>
              {stats.soldPasses} Sold of {stats.maxTickets}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl editorial-card flex items-center gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg text-amber-400 font-black shrink-0">₹10k</div>
            <div className="text-[11px] sm:text-xs text-slate-300">
              <strong className="block text-white font-semibold">Prize Pool</strong>
              Gold & Trophies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
