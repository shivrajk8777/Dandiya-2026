"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, MapPin, Clock, Ticket, Search, ShieldCheck, ArrowRight, Star } from "lucide-react";

export default function Hero({ onOpenRegister, onOpenLookup }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 18);
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
        {/* Top festival badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#160829] border border-[#e5b869]/30 mb-6 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#e5b869]" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#e5b869] font-sans">
            6th Annual Navratri Mahotsav
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
            October 18 – 20, 2026
          </span>
        </div>

        {/* Hindi Sanskrit Inscription */}
        <div className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#e5b869]/90 uppercase font-serif-royal mb-3">
          ॥ अखंड आनंद, राजसी गरबा एवं डांडिया रास ॥
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] mb-6 font-serif-royal">
          <span className="text-white">ROYAL HERITAGE </span>
          <br />
          <span className="text-gold-gradient font-sans-modern font-black">
            DANDIYA RAAS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 font-light mb-8 leading-relaxed">
          Experience Gujarat’s most prestigious Navratri cultural festival. 3 grand evenings with 100-piece live Dhol symphony, celebrity headliners, 40,000 sq.ft wooden arena, and royal Kathiyawadi dining.
        </p>

        {/* Event Meta Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl editorial-card">
            <Calendar className="w-4 h-4 text-[#e5b869]" />
            <span className="font-medium">Oct 18 - 20, 2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl editorial-card">
            <Clock className="w-4 h-4 text-[#fb7185]" />
            <span className="font-medium">07:00 PM to 01:00 AM</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl editorial-card">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Royal Palace Lawns, Ahmedabad</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <button
            onClick={() => onOpenRegister()}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#e5b869] via-[#d4a359] to-[#c9933b] hover:from-[#fef08a] hover:to-[#e5b869] text-black font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#e5b869]/15 flex items-center justify-center gap-2.5 group hover:scale-[1.01] active:scale-95 transition-all"
          >
            <Ticket className="w-4 h-4 text-black" />
            <span>Book Official Passes</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenLookup}
            className="w-full sm:w-auto px-6 py-4 bg-[#140826] hover:bg-[#1a0b33] border border-[#e5b869]/30 hover:border-[#e5b869] text-slate-200 hover:text-white font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-[#e5b869]" />
            <span>Retrieve Existing Pass</span>
          </button>
        </div>

        {/* Live Glass Countdown Timer */}
        <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl editorial-card relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e5b869] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#e5b869]" />
              Event Gates Open In
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              Early-Bird Tiers Available
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3.5 text-center">
            <div className="bg-[#0b0314] p-3 sm:p-4 rounded-2xl border border-white/5">
              <div className="text-2xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-1">
                Days
              </div>
            </div>
            <div className="bg-[#0b0314] p-3 sm:p-4 rounded-2xl border border-white/5">
              <div className="text-2xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-1">
                Hours
              </div>
            </div>
            <div className="bg-[#0b0314] p-3 sm:p-4 rounded-2xl border border-white/5">
              <div className="text-2xl sm:text-4xl font-black text-white font-sans">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-1">
                Minutes
              </div>
            </div>
            <div className="bg-[#0b0314] p-3 sm:p-4 rounded-2xl border border-white/5">
              <div className="text-2xl sm:text-4xl font-black text-[#e5b869] font-sans">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider mt-1">
                Seconds
              </div>
            </div>
          </div>
        </div>

        {/* Live Festival Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 max-w-4xl mx-auto text-left">
          <div className="p-3.5 sm:p-4 rounded-2xl editorial-card flex items-center gap-3">
            <div className="text-lg text-[#e5b869] font-black">10K+</div>
            <div className="text-xs text-slate-300">
              <strong className="block text-white font-semibold">Attendees</strong>
              Open Arena
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl editorial-card flex items-center gap-3">
            <div className="text-lg text-[#fb7185] font-black">100</div>
            <div className="text-xs text-slate-300">
              <strong className="block text-white font-semibold">Dhol Symphony</strong>
              Live Percussion
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl editorial-card flex items-center gap-3">
            <div className="text-lg text-purple-400 font-black">40K</div>
            <div className="text-xs text-slate-300">
              <strong className="block text-white font-semibold">Sq.Ft Hardwood</strong>
              Cushioned Floor
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl editorial-card flex items-center gap-3">
            <div className="text-lg text-emerald-400 font-black">₹5L</div>
            <div className="text-xs text-slate-300">
              <strong className="block text-white font-semibold">Prize Pool</strong>
              Gold & Trophies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
