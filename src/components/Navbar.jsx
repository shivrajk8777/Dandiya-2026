"use client";
import React, { useState, useEffect } from "react";
import { Shield, Search, Menu, X, Ticket, Crown, Flame } from "lucide-react";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";
import { subscribeToRegistrations } from "@/lib/registrationService";

export default function Navbar({ onOpenRegister, onOpenLookup, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 w-full ${scrolled
        ? "bg-[#07030e]/95 backdrop-blur-xl border-b border-[#e5b869]/20 py-3 shadow-2xl"
        : "bg-[#07030e]/80 backdrop-blur-md border-b border-white/5 py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo Only */}
        <a href="#" className="flex items-center group">
          <img
            src="/logo.png"
            alt="Rang Tarang Garba"
            className="h-10 sm:h-12 md:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(249,115,22,0.5)] group-hover:scale-105 transition-all duration-300"
          />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <a href="#experience" className="hover:text-[#e5b869] transition-colors">
            Experience
          </a>
          <a href="#artists" className="hover:text-[#e5b869] transition-colors">
            Headliners
          </a>
          <a href="#passes" className="hover:text-[#e5b869] transition-colors">
            VIP Passes
          </a>
          <a href="#schedule" className="hover:text-[#e5b869] transition-colors">
            Schedule
          </a>
          <a href="#gallery" className="hover:text-[#e5b869] transition-colors">
            Gallery
          </a>
          <a href="#faq" className="hover:text-[#e5b869] transition-colors">
            Guidelines
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Find Pass */}
          <button
            onClick={onOpenLookup}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            title="Search and download your registered pass"
          >
            <Search className="w-3.5 h-3.5 text-[#e5b869]" />
            Find Pass
          </button>

          {/* Book Passes CTA */}
          <button
            onClick={() => onOpenRegister()}
            className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#c9933b] hover:from-white hover:to-[#e5b869] text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 animate-pass-blink"
          >
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0 animate-bounce" />
            <span className="whitespace-nowrap font-black">Book Passes</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black bg-black/25 text-black border border-black/20">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 mr-1 animate-blink-dot" />
              {stats.remainingTickets} Left
            </span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-200 hover:text-white bg-white/5 rounded-xl border border-white/10 shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0414]/98 backdrop-blur-2xl border-b border-[#e5b869]/20 px-5 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-3.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              The Experience
            </a>
            <a
              href="#artists"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              Star Headliners
            </a>
            <a
              href="#passes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              VIP Passes & Cabanas
            </a>
            <a
              href="#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              Evening Schedule
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              Photo Gallery
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#e5b869]"
            >
              Guidelines & FAQ
            </a>
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#c9933b] text-black font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl animate-pass-blink"
            >
              <Ticket className="w-4 h-4 text-black animate-bounce" />
              <span>Book Passes ({stats.remainingTickets} Left)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLookup();
                }}
                className="py-2.5 bg-white/5 border border-white/10 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-1.5 text-xs"
              >
                <Search className="w-3.5 h-3.5 text-[#e5b869]" />
                Find Pass
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="py-2.5 bg-white/5 border border-white/10 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-1.5 text-xs"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
