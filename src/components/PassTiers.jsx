import React, { useState, useEffect } from "react";
import { Check, Sparkles, User, Users, Crown, Flame, ShieldCheck, ArrowRight, Tag, Clock, AlertCircle } from "lucide-react";
import { subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";
import { subscribeToInventoryConfig, computeTicketStats } from "@/lib/ticketInventoryService";
import { subscribeToRegistrations } from "@/lib/registrationService";

export const PASS_OPTIONS = [
  {
    id: "royal_couple_vip",
    name: "Royal VIP Couple Pass",
    tier: "Couple Exclusive Entry (2 Persons)",
    price: 1599,
    tag: "Couple Ticket Pass",
    icon: Users,
    featured: true,
    color: "from-[#e5b869] via-rose-500 to-purple-600",
    features: [
      "Exclusive Entry for 2 Persons (Couple Entry Only)",
      "2 Pairs of Free Handcrafted Wooden Dandiya Sticks",
      "Fast-Track Red Carpet VIP Entry Lane (Zero Waiting)",
      "Access to Kathiyawadi Gourmet Food Village & VIP Lounge",
      "Access to Live 100-Dhol & DJ EDM Concert Ground",
      "Automatic Entry into 'Best Royal Couple' Trophy Contest"
    ]
  }
];

export default function PassTiers({ onSelectPass }) {
  const [discountConfig, setDiscountConfig] = useState(null);
  const [inventoryConfig, setInventoryConfig] = useState({ maxTickets: 300 });
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const unsubDisc = subscribeToDiscountConfig((cfg) => setDiscountConfig(cfg));
    const unsubInv = subscribeToInventoryConfig((inv) => setInventoryConfig(inv));
    const unsubReg = subscribeToRegistrations((list) => setRegistrations(list));

    return () => {
      if (typeof unsubDisc === "function") unsubDisc();
      if (typeof unsubInv === "function") unsubInv();
      if (typeof unsubReg === "function") unsubReg();
    };
  }, []);

  const pricing = calculateTicketPrice(discountConfig);
  const stats = computeTicketStats(inventoryConfig, registrations);
  const maxTickets = stats.maxTickets;
  const soldPasses = stats.soldPasses;
  const remainingTickets = stats.remainingTickets;
  const isSoldOut = stats.isSoldOut;

  return (
    <section id="passes" className="py-24 relative bg-[#07030e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160829] border border-[#e5b869]/30 text-[#e5b869] text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Official Event Ticket Pass
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif-royal">
            Get Your <span className="text-gold-gradient font-sans-modern font-black">Royal VIP Pass</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            All-inclusive access to Rajasthan's most grand Dandiya Mahotsav 2026 including Dandiya sticks, VIP arena, and instant digital QR e-ticket.
          </p>

          {/* Live Inventory & Sales Status Card */}
          <div className="mt-8 max-w-xl mx-auto p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#19062b] to-[#0c0316] border border-amber-500/35 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px] sm:text-xs">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                Live Ticket Booking & Stock Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSoldOut ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}>
                {isSoldOut ? "Sold Out" : `${stats.soldPercentage}% Booked`}
              </span>
            </div>

            {/* 3 Metrics Box */}
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block">Total Capacity</span>
                <span className="text-sm sm:text-lg font-black text-white font-sans">{maxTickets}</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block">Passes Sold</span>
                <span className="text-sm sm:text-lg font-black text-amber-400 font-sans">{soldPasses}</span>
              </div>
              <div className={`p-2 sm:p-2.5 rounded-xl border ${isSoldOut ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold block">Available Left</span>
                <span className="text-sm sm:text-lg font-black font-sans">{remainingTickets}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-black/60 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-700 relative"
                  style={{ width: `${Math.max(4, Math.min(100, stats.soldPercentage))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="text-emerald-400 font-medium">⚡ {remainingTickets} Couple Passes Available</span>
                <span className="text-slate-300">{soldPasses} Passes Sold</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          {PASS_OPTIONS.map((tier) => {
            const Icon = tier.icon;
            const currentPrice = pricing.finalPrice;
            const isDiscounted = pricing.isDiscounted;


            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-6 sm:p-8 pt-9 sm:pt-10 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-[#250d3e] via-[#140626] to-[#1c0830] border-2 shadow-2xl ${
                  isSoldOut
                    ? "border-slate-700 opacity-90 shadow-none"
                    : "border-[#e5b869] shadow-[#e5b869]/25 hover:scale-[1.01]"
                }`}
              >
                {/* Floating Top Ribbon */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  {isSoldOut ? (
                    <span className="px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xl bg-gradient-to-r from-rose-600 to-red-700 border border-rose-400/40 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                      OUT OF STOCK
                    </span>
                  ) : isDiscounted && pricing.discountBadge ? (
                    <span className="px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-950 shadow-xl bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 border border-emerald-300/50 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-950" />
                      {pricing.discountBadge}
                    </span>
                  ) : (
                    <span className="px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-black shadow-xl bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#f97316]">
                      {tier.tag}
                    </span>
                  )}
                </div>

                <div>
                  {/* Top Icon & Badge Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e5b869]/15 border border-[#e5b869]/40 flex items-center justify-center text-[#e5b869] shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      Couple Entry (2 Pax)
                    </span>
                  </div>

                  {/* Pass Title */}
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 font-serif-royal leading-tight">
                    {tier.name}
                  </h3>

                  {/* Price Display */}
                  <div className="my-5">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl sm:text-5xl font-black text-amber-400 font-sans">
                        ₹{currentPrice}
                      </span>
                      {isDiscounted && (
                        <span className="text-lg text-slate-400 line-through font-semibold">
                          ₹{pricing.basePrice}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm text-slate-300 font-medium">/ all taxes incl.</span>
                    </div>

                    {isDiscounted && pricing.discountReason && (
                      <div className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{pricing.discountReason}</span>
                      </div>
                    )}

                    {/* Card-level live availability ticker */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-[#090214] border border-amber-500/30 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        {remainingTickets} Available Left
                      </span>
                      <span className="text-[11px] text-amber-300 font-semibold font-mono">
                        {soldPasses} of {maxTickets} Sold
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/10 my-5" />


                  {/* Inclusions */}
                  <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 font-normal">
                        <div className="p-0.5 rounded-full bg-[#e5b869]/20 text-[#e5b869] mt-0.5 shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => !isSoldOut && onSelectPass({ ...tier, price: currentPrice })}
                    disabled={isSoldOut}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                      isSoldOut
                        ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                        : "text-black shadow-xl shadow-[#e5b869]/20 bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#c9933b] hover:opacity-95 active:scale-95"
                    }`}
                  >
                    <span>
                      {isSoldOut ? `OUT OF STOCK (${soldPasses}/${maxTickets} SOLD)` : `Book VIP Couple Pass (₹${currentPrice})`}
                    </span>
                    {!isSoldOut && <ArrowRight className="w-4 h-4 text-black" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Seal */}
        <div className="mt-14 max-w-3xl mx-auto p-4 rounded-2xl editorial-card flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Guaranteed Instant E-Ticket:</strong> Digital QR pass is generated immediately with anti-counterfeit cryptographic serial hash.
            </span>
          </div>
          <span className="text-[#e5b869] font-semibold shrink-0">100% Verified Entry</span>
        </div>
      </div>
    </section>
  );
}
