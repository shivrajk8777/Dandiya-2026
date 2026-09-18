"use client";
import React from "react";
import { Check, Sparkles, User, Users, Crown, Flame, ShieldCheck, ArrowRight } from "lucide-react";

export const PASS_OPTIONS = [
  {
    id: "silver",
    name: "Silver General Pass",
    tier: "General Access",
    price: 299,
    tag: "Individual Entry",
    icon: User,
    color: "from-[#e5b869] to-[#c9933b]",
    features: [
      "1 Person Entry to 40,000 sq.ft Wooden Dance Floor",
      "1 Pair of Free Handcrafted Wooden Dandiya Sticks",
      "Access to Kathiyawadi Gourmet Food Village",
      "Access to Live 100-Dhol & DJ EDM Ground",
      "Entry into 'Garba Prince / Princess' Award Pool"
    ]
  },
  {
    id: "gold",
    name: "Gold Royal Couple",
    tier: "Couple Exclusive",
    price: 499,
    tag: "Most Popular",
    icon: Users,
    color: "from-[#fb7185] to-[#e5b869]",
    featured: true,
    features: [
      "Exclusive Entry for 2 (Couple / Duo)",
      "2 Pairs of Free Designer Dandiya Sticks",
      "Fast-Track Red Carpet Entry Lane (No Queues)",
      "₹150 Complimentary Gourmet Food Voucher Included",
      "Automatic Entry into 'Best Royal Couple' Trophy"
    ]
  },
  {
    id: "platinum",
    name: "Platinum VIP Lounge",
    tier: "VIP All-Access",
    price: 999,
    tag: "VIP Luxury",
    icon: Crown,
    color: "from-purple-400 to-[#e5b869]",
    features: [
      "1 VIP Pass with Elevated Stage-Facing Lounge",
      "Premium LED Glow Electronic Dandiya Sticks",
      "Dedicated VIP Valet Parking & Red Carpet Lane",
      "Unlimited Mocktails & Gourmet Appetizers in Lounge",
      "Backstage Access & Meet Celebrity Headliners"
    ]
  },
  {
    id: "diamond",
    name: "Diamond Emperor Suite (5 Pax)",
    tier: "Private Cabana (5 Pax)",
    price: 1199,
    tag: "Group Suite",
    icon: Flame,
    color: "from-emerald-400 to-teal-500",
    features: [
      "Private Reserved Lounge Sofa Cabana for 5 Persons",
      "5 Pairs of Free Dandiya Sticks",
      "Personal Table Butler Service & Welcome Platter",
      "Free 360° Cinematic Video Booth Session for Group",
      "Complimentary Valet Parking for 2 Vehicles"
    ]
  }
];

export default function PassTiers({ onSelectPass }) {
  return (
    <section id="passes" className="py-24 relative bg-[#07030e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160829] border border-[#e5b869]/30 text-[#e5b869] text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Official Pass Collection
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif-royal">
            Select Your <span className="text-gold-gradient font-sans-modern font-black">Royal Access</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            Every pass tier includes complimentary handcrafted Dandiya sticks, concert DJ access, and instant digital QR e-ticketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASS_OPTIONS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  tier.featured
                    ? "bg-gradient-to-b from-[#210c38] via-[#120522] to-[#1c0830] border-2 border-[#e5b869] shadow-2xl shadow-[#e5b869]/20 scale-[1.02] lg:-translate-y-2"
                    : "editorial-card hover:scale-[1.01]"
                }`}
              >
                {/* Floating Tag */}
                {tier.tag && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black shadow-md bg-gradient-to-r from-[#fef08a] to-[#e5b869]`}
                    >
                      {tier.tag}
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mt-2 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e5b869]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {tier.tier}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 font-serif-royal">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 my-4">
                    <span className="text-3xl sm:text-4xl font-black text-white font-sans">
                      ₹{tier.price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ all taxes incl.</span>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/10 my-4" />

                  {/* Inclusions */}
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-light">
                        <div className="p-0.5 rounded-full bg-[#e5b869]/20 text-[#e5b869] mt-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onSelectPass(tier)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-black shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${
                      tier.featured
                        ? "from-[#fef08a] via-[#e5b869] to-[#c9933b] hover:opacity-95 shadow-[#e5b869]/20"
                        : "from-[#e5b869] to-[#c9933b] hover:opacity-95"
                    }`}
                  >
                    <span>Book {tier.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
