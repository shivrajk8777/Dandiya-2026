import React, { useState, useEffect } from "react";
import { Check, Sparkles, User, Users, Crown, Flame, ShieldCheck, ArrowRight, Tag, Clock } from "lucide-react";
import { subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";

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

  useEffect(() => {
    const unsubscribe = subscribeToDiscountConfig((cfg) => {
      setDiscountConfig(cfg);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const pricing = calculateTicketPrice(discountConfig);

  return (
    <section id="passes" className="py-24 relative bg-[#07030e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        </div>

        <div className="max-w-lg mx-auto">
          {PASS_OPTIONS.map((tier) => {
            const Icon = tier.icon;
            const currentPrice = pricing.finalPrice;
            const isDiscounted = pricing.isDiscounted;

            return (
              <div
                key={tier.id}
                className="relative rounded-3xl p-6 sm:p-8 pt-9 sm:pt-10 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-[#250d3e] via-[#140626] to-[#1c0830] border-2 border-[#e5b869] shadow-2xl shadow-[#e5b869]/25 hover:scale-[1.01]"
              >
                {/* Floating Top Ribbon */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  {isDiscounted && pricing.discountBadge ? (
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
                    onClick={() => onSelectPass({ ...tier, price: currentPrice })}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-black shadow-xl shadow-[#e5b869]/20 transition-all flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#fef08a] via-[#e5b869] to-[#c9933b] hover:opacity-95 active:scale-95"
                  >
                    <span>Book VIP Couple Pass (₹{currentPrice})</span>
                    <ArrowRight className="w-4 h-4 text-black" />
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
