"use client";
import React from "react";
import { Phone, Mail, MapPin, Sparkles, Heart, Shield, Crown, Award, CheckCircle } from "lucide-react";

export default function Footer({ onOpenAdmin, onOpenRegister, onOpenLookup }) {
  return (
    <footer className="relative border-t border-amber-500/30 bg-[#05010b] pt-18 pb-14 overflow-hidden text-slate-400 text-xs sm:text-sm">
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-28 bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-purple-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Col 1: Brand & Legacy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px] shadow-lg">
                <div className="w-full h-full bg-[#0d041c] rounded-[14px] flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-white font-serif-royal">
                  UTSAV <span className="gold-foil-text font-sans-modern font-black">RAAS</span>
                </span>
                <p className="text-[10px] text-amber-300/80 font-bold uppercase tracking-widest">
                  Season 6 • Navratri 2026
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              India’s premier cultural fest celebrating the sublime divinity of Maa Ambe with royal Gujarati traditions, concert audio architecture, and world-class hospitality.
            </p>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5 font-serif-royal">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ॥ जय श्री अम्बे माँ - शुभ नवरात्रि ॥
            </div>
          </div>

          {/* Col 2: Festival Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-serif-royal">
              Festival Access
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#experience" className="hover:text-amber-400 transition-colors">
                  The Royal Experience
                </a>
              </li>
              <li>
                <a href="#artists" className="hover:text-amber-400 transition-colors">
                  Star Headline Performers
                </a>
              </li>
              <li>
                <a href="#passes" className="hover:text-amber-400 transition-colors">
                  VIP Passes & Emperor Cabanas
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-amber-400 transition-colors">
                  Evening Itinerary
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-400 transition-colors">
                  Archival Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Attendee Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-serif-royal">
              Ticketing & Concierge
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenRegister()}
                  className="hover:text-amber-400 transition-colors text-left font-semibold text-white"
                >
                  ⚡ Book Official E-Pass (Instant QR)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLookup}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  🔍 Retrieve / Re-Download E-Pass
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5 text-purple-300 font-bold"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Admin Gate Control & Scanner
                </button>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Supported: GPay • PhonePe • Paytm • BHIM • UPI
              </li>
            </ul>
          </div>

          {/* Col 4: Venue & Protocol Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-serif-royal">
              Royal Venue & Desk
            </h4>
            <div className="space-y-2 text-xs font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-normal">
                  Royal Palace Lawns, SG Highway & Ring Road, Ahmedabad, Gujarat
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200 font-mono">+91 98765 43210 / +91 79 4000 8900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>concierge@utsavraas.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & accreditation */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 UTSAV RAAS Cultural Foundation & Regal Events. All Rights Reserved. Powered by Firebase Realtime.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Entry
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Gujarat Heritage Grade A
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
