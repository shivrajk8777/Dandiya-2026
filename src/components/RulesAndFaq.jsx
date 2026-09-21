"use client";
import React, { useState } from "react";
import { ChevronDown, Shirt, QrCode, AlertCircle, Sparkles } from "lucide-react";

export default function RulesAndFaq() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Do I need to carry my physical pass or is mobile QR pass sufficient?",
      a: "Mobile digital pass with QR code is 100% sufficient! Simply download the pass onto your smartphone or take a screenshot and present it at the gate for fast barcode scanning."
    },
    {
      q: "Will Dandiya sticks be provided at the venue?",
      a: "Yes! Every Royal VIP Couple Pass includes 2 pairs of complimentary decorated wooden Dandiya sticks provided at the entry reception."
    },
    {
      q: "What is the dress code for the event?",
      a: "Traditional ethnic wear is mandatory! For ladies: Chaniya Choli, Lehenga, or traditional Kurti. For men: Kurta Pajama, Dhoti, or Kedia. Traditional attire is also required to qualify for contest prizes."
    },
    {
      q: "Are kids allowed and do they require separate tickets?",
      a: "Children below 5 years of age get free entry with their parents. Entry to the venue is strictly for Couples."
    },
    {
      q: "Can I retrieve my pass if I lose the download link?",
      a: "Yes! You can use the 'Find My Pass' button on our header anytime, enter your registered WhatsApp phone number, and instantly view or re-download your digital pass."
    },
    {
      q: "Is outside food and drinks permitted?",
      a: "Outside food and drinks are strictly prohibited. A multi-cuisine food court with authentic Gujarati food stalls, snacks, and fresh mocktails is available inside the venue."
    }
  ];

  return (
    <section id="faq" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Important Information
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Guidelines & <span className="gold-gradient-text">FAQ</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Everything you need to know before stepping into the magical Dandiya arena.
          </p>
        </div>

        {/* 3 Guidelines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="festive-card-glass rounded-2xl p-6 border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Shirt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Traditional Attire</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step in your best vibrant Chaniya Choli or Kedia/Kurta. Let’s celebrate the rich heritage of Gujarat in full traditional color!
            </p>
          </div>

          <div className="festive-card-glass rounded-2xl p-6 border-rose-500/30">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Digital QR Entry</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Keep your E-Pass QR code ready on your mobile screen with screen brightness turned up for lightning-fast scan & entry.
            </p>
          </div>

          <div className="festive-card-glass rounded-2xl p-6 border-purple-500/30">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Family Safe Environment</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Alcohol, smoking, and offensive behavior are strictly prohibited. Zero tolerance policy to ensure a safe family atmosphere.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="festive-card-glass rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 border-t border-white/5 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
